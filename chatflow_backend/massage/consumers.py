
import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ValidationError
from .models import User_Account


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        from .models import Room, Topic

        kwargs = self.scope["url_route"]["kwargs"]
        self.room_slug = kwargs.get("room_slug")
        self.topic_slug = kwargs.get("topic_slug")

        self.topic_group_name = None
        self.room = None
        self.topic = None

        user = self.scope["user"]

        if not user.is_authenticated:
            await self.close()
            return

        if not self.room_slug or not self.topic_slug:
            await self.accept()
            return

        try:
            self.room = await self.get_room(self.room_slug)
            self.topic = await self.get_topic(self.topic_slug, self.room)

        except Exception as e:
            print("ROOM ERROR:", e)
            await self.close()
            return

        self.topic_group_name = f"chat_room_{self.room_slug}_topic_{self.topic_slug}"

        await self.channel_layer.group_add(
            self.topic_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        if self.topic_group_name:
            await self.channel_layer.group_discard(
                self.topic_group_name,
                self.channel_name
            )

    @database_sync_to_async
    def get_room(self, slug):
        from .models import Room

        room, created = Room.objects.get_or_create(
            slug=slug,
            defaults={"name": slug}
        )

        return room

    @database_sync_to_async
    def get_topic(self, slug, room):
        from .models import Topic

        topic, created = Topic.objects.get_or_create(
            slug=slug,
            room=room,
            defaults={"name": slug}
        )

        return topic

    @database_sync_to_async
    def get_media_url(self, message_id):
        from .models import Massage

        message = Massage.objects.select_related("file").get(id=message_id)

        if message.file:
            return message.file.media.url

        return None

    @database_sync_to_async
    def find_user(self, target_key):

        from .models import User_Account

        return User_Account.objects.get(key=target_key)

    async def search_user(self, data):
        target_key = (data.get("KEY_user") or "").strip()

        if not target_key:
            await self.send_json({
                "type": "error",
                "message": "کد کاربر ارسال نشده"
            })
            return

        try:
            target = await self.find_user(target_key)

        except (User_Account.DoesNotExist, ValidationError, ValueError):
            await self.send_json({
                "type": "error",
                "message": "کاربری با این کد پیدا نشد"
            })
            return

        if target.pk == self.scope["user"].pk:
            await self.send_json({
                "type": "error",
                "message": "این کد خودته!"
            })
            return

        avatar = await self.get_avatar_url(target)

        await self.send_json({
            "type": "user_found",
            "username": target.username,
            "name": target.name,
            "bio": target.bio,
            "username_key": target.key,
            "avatar": avatar
        })

    @database_sync_to_async
    def get_avatar_url(self, user):
        if user.avatar:
            return user.avatar.url

        return None

    @database_sync_to_async
    def find_direct(self, current_user, target_user):
        from .models import Direct

        return Direct.objects.filter(
            user_Direct=current_user
        ).filter(
            user_Direct=target_user
        ).first()

    @database_sync_to_async
    def create_direct_chat(self, current_user, target_user):
        from .models import Direct

        chat = Direct.objects.create()
        chat.user_Direct.add(current_user, target_user)

        return chat.key

    async def create_direct(self, data):
        from .models import User_Account

        target_key = (data.get("KEY_user") or "").strip()

        if not target_key:
            await self.send_json({
                "type": "error",
                "message": "کد کاربر ارسال نشده"
            })
            return

        try:
            target_user = await self.find_user(target_key)

        except (User_Account.DoesNotExist, ValidationError, ValueError):
            await self.send_json({
                "type": "error",
                "message": "کاربری با این کد پیدا نشد"
            })
            return

        current_user = self.scope["user"]

        if target_user.pk == current_user.pk:
            await self.send_json({
                "type": "error",
                "message": "نمی‌تونی با خودت چت بسازی"
            })
            return

        chat = await self.find_direct(current_user, target_user)

        if not chat:
            chat_key = await self.create_direct_chat(current_user, target_user)
        else:
            chat_key = chat.key

        await self.send_json({
            "type": "chat_KEY",
            "chat_key": str(chat_key)
        })

    @database_sync_to_async
    def delete_message_from_db(self, message_id):
        from .models import Massage

        try:
            message = Massage.objects.get(
                id=message_id,
                room=self.room,
                topic=self.topic
            )
        except Massage.DoesNotExist:
            return False

        if message.user_id != self.scope["user"].id:
            return False

        message.delete()

        return True

    async def delete_mass(self, data):
        message_id = data.get("massageId")

        if not message_id:
            return

        deleted = await self.delete_message_from_db(message_id)

        if not deleted:
            return

        if self.topic_group_name:
            await self.channel_layer.group_send(
                self.topic_group_name,
                {
                    "type": "del_massage",
                    "id_massage": message_id
                }
            )

    async def del_massage(self, event):
        await self.send_json({
            "type": "message_deleted",
            "mass_id": event["id_massage"]
        })

    async def receive(self, text_data):
        from .models import Massage, User_Account

        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send_json({
                "type": "error",
                "message": "فرمت پیام نامعتبر است"
            })
            return

        message_type = data.get("type")

        if message_type == "search_user":
            await self.search_user(data)
            return

        if message_type == "create_direct":
            await self.create_direct(data)
            return

        if not self.topic_group_name:
            return

        if message_type == "delete_message":
            await self.delete_mass(data)
            return

        if message_type == "message":
            message = data.get("message")

            if not message and not data.get("mediaId"):
                return

            my_model = await self.create_message(
                message,
                data.get("mediaId")
            )

            media_url = await self.get_media_url(my_model.id)
            avatar_url = await self.get_avatar_url(self.scope["user"])

            await self.channel_layer.group_send(
                self.topic_group_name,
                {
                    "type": "chat_topic_message",
                    "message": message,
                    "username": self.scope["user"].username,
                    "date_massage": my_model.publish_date.isoformat(),
                    "massage_id": my_model.id,
                    "username_id": self.scope["user"].id,
                    "media_URL": media_url,
                    "username_key": self.scope["user"].key,
                    "avatar_user": avatar_url
                }
            )

    @database_sync_to_async
    def create_message(self, message, media_id):
        from .models import Massage

        return Massage.objects.create(
            payam=message,
            room=self.room,
            user=self.scope["user"],
            topic=self.topic,
            file_id=media_id
        )

    async def chat_topic_message(self, event):
        await self.send_json({
            "type": "chat_topic_message",
            "message": event["message"],
            "username": event["username"],
            "date": event["date_massage"],
            "id": event["massage_id"],
            "username_id": event["username_id"],
            "username_key": event["username_key"],
            "media_URL": event["media_URL"],
            "avatar_user": event["avatar_user"]
        })

    async def send_json(self, data):
        await self.send(text_data=json.dumps(data))
