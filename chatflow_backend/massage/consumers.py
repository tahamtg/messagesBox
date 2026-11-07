import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.db import transaction
from django.db.models import Count
from .models import User_Account


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
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
            self.topic = await self.get_topic(
                self.topic_slug,
                self.room
            )

        except Exception as e:
            print("ROOM ERROR:", e)
            await self.close()
            return

        self.topic_group_name = (
            f"chat_room_{self.room_slug}_topic_{self.topic_slug}"
        )

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
    def find_user(self, target_key):
        try:
            user = User_Account.objects.get(key=target_key)

            return {
                "id": user.id,
                "username": user.username,
                "name": user.name,
                "bio": user.bio,
                "key": user.key,
                "avatar": user.avatar.url if user.avatar else None
            }

        except User_Account.DoesNotExist:
            return None

    async def search_user(self, data):
        target_key = (data.get("KEY_user") or "").strip()

        if not target_key:
            await self.send_json({
                "type": "error",
                "message": "کد کاربر ارسال نشده"
            })
            return

        target = await self.find_user(target_key)

        if not target:
            await self.send_json({
                "type": "error",
                "message": "کاربری با این کد پیدا نشد"
            })
            return

        if target["id"] == self.scope["user"].id:
            await self.send_json({
                "type": "error",
                "message": "شما نمی‌توانید کد خودتان را وارد کنید!"
            })
            return

        await self.send_json({
            "type": "user_found",
            "username": target["username"],
            "name": target["name"],
            "bio": target["bio"],
            "username_key": target["key"],
            "avatar": target["avatar"]
        })

    @database_sync_to_async
    def get_or_create_direct(self, current_user_id, target_key):
        from .models import Direct

        with transaction.atomic():

            try:
                target_user = User_Account.objects.get(key=target_key)
            except User_Account.DoesNotExist:
                return None

            if target_user.id == current_user_id:
                return None

            user_ids = sorted([
                current_user_id,
                target_user.id
            ])

            list(
                User_Account.objects.select_for_update()
                .filter(id__in=user_ids)
                .order_by("id")
            )

            chat = (
                Direct.objects
                .annotate(user_count=Count("user_Direct"))
                .filter(user_Direct__id=current_user_id)
                .filter(user_Direct__id=target_user.id)
                .filter(user_count=2)
                .first()
            )

            if chat:
                return chat.key

            chat = Direct.objects.create()

            chat.user_Direct.add(
                current_user_id,
                target_user.id
            )

            return chat.key

    async def create_direct(self, data):
        target_key = (data.get("KEY_user") or "").strip()

        if not target_key:
            await self.send_json({
                "type": "error",
                "message": "کد کاربر ارسال نشده"
            })
            return

        chat_key = await self.get_or_create_direct(
            self.scope["user"].id,
            target_key
        )

        if not chat_key:
            await self.send_json({
                "type": "error",
                "message": "کاربر پیدا نشد یا امکان ساخت چت وجود ندارد"
            })
            return

        await self.send_json({
            "type": "chat_KEY",
            "chat_key": str(chat_key)
        })

    @database_sync_to_async
    def get_media_url(self, message_id):
        from .models import Massage

        message = Massage.objects.select_related("file").get(
            id=message_id
        )

        if message.file:
            return message.file.media.url

        return None

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

    @database_sync_to_async
    def create_message(self, message, media_id):
        from .models import Massage

        obj = Massage.objects.create(
            payam=message,
            room_id=self.room.id,
            user_id=self.scope["user"].id,
            topic_id=self.topic.id,
            file_id=media_id
        )

        return {
            "id": obj.id,
            "date": obj.publish_date.isoformat()
        }

    @database_sync_to_async
    def get_avatar_url(self, user):
        return user.avatar.url if user.avatar else None

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except (json.JSONDecodeError, TypeError):
            await self.send_json({
                "type": "error",
                "message": "فرمت پیام نامعتبر است"
            })
            return

        if not isinstance(data, dict):
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
            message = data.get("message") or ""
            media_id = data.get("mediaId")

            if not message and not media_id:
                return

            my_model = await self.create_message(
                message,
                media_id
            )

            media_url = await self.get_media_url(my_model["id"])
            avatar_url = await self.get_avatar_url(
                self.scope["user"]
            )

            await self.channel_layer.group_send(
                self.topic_group_name,
                {
                    "type": "chat_topic_message",
                    "message": message,
                    "username": self.scope["user"].username,
                    "date_massage": my_model["date"],
                    "massage_id": my_model["id"],
                    "username_id": self.scope["user"].id,
                    "media_URL": media_url,
                    "username_key": self.scope["user"].key,
                    "avatar_user": avatar_url
                }
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