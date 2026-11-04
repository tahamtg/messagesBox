import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ValidationError

class ChatConsumer(AsyncWebsocketConsumer):

    ########Connect########

    async def connect(self):
        from .models import Room, Topic

        kwargs = self.scope["url_route"]["kwargs"]
        self.room_slug = kwargs.get("room_slug")
        self.topic_slug = kwargs.get("topic_slug")

        self.topic_group_name = None
        self.room = None
        self.topic = None

        # Authentication
        user = self.scope["user"]
        if not user.is_authenticated:
            await self.close()
            return

        if not self.room_slug or not self.topic_slug:
            await self.accept()
            return

        try:
            self.room, room_created = await sync_to_async(
                Room.objects.get_or_create
            )(slug=self.room_slug, defaults={"name": self.room_slug})
        except Exception as e:
            print("ROOM ERROR:", e)
            await self.close()
            return

        try:
            self.topic, topic_created = await sync_to_async(
                Topic.objects.get_or_create
            )(slug=self.topic_slug, room=self.room, defaults={"name": self.topic_slug})
        except Exception as e:
            print("TOPIC ERROR:", e)
            await self.close()
            return

        self.topic_group_name = f"chat_room_{self.room_slug}_topic_{self.topic_slug}"
        await self.channel_layer.group_add(self.topic_group_name, self.channel_name)

        await self.accept()

    ########Disconnect########

    async def disconnect(self, close_code):
        if getattr(self, "topic_group_name", None):
            await self.channel_layer.group_discard(
                self.topic_group_name,
                self.channel_name
            )

    # For async file model
    @database_sync_to_async
    def get_media_url(self, message_id):
        from .models import Massage

        message = Massage.objects.select_related("file").get(id=message_id)

        if message.file:
            return message.file.media.url

        return None

    ########DIRECT########

    async def create_direct(self, data):
        from .models import User_Account, Direct

        current_user = self.scope["user"]
        target_user_key = data.get("KEY_user")

        if not target_user_key:
            await self.send(text_data=json.dumps({
                "type": "error", "message": "کد کاربر ارسال نشده"
            }))
            return

        try:
            target_user = await sync_to_async(User_Account.objects.get)(
                key=target_user_key
            )
        except (User_Account.DoesNotExist, ValidationError, ValueError):
            await self.send(text_data=json.dumps({
                "type": "error", "message": "کاربری با این کد پیدا نشد"
            }))
            return

        if target_user.pk == current_user.pk:
            await self.send(text_data=json.dumps({
                "type": "error", "message": "نمی‌تونی با خودت چت بسازی"
            }))
            return

        chat = await sync_to_async(
            lambda: Direct.objects.filter(user_Direct=current_user)
                                  .filter(user_Direct=target_user)
                                  .first()
        )()

        if not chat:
            chat = await sync_to_async(Direct.objects.create)()
            await sync_to_async(chat.user_Direct.add)(current_user, target_user)

        await self.send(text_data=json.dumps({
            "type": "chat_KEY",
            "chat_key": str(chat.key)
        }))

        async def search_user(self, data):
        

            target_key = (data.get("KEY_user") or "").strip()

            if not target_key:
                await self.send(text_data=json.dumps({
                    "type": "error", "message": "کد کاربر ارسال نشده"
                }))
                return

            try:
                target = await sync_to_async(User_Account.objects.get)(key=target_key)
            except (User_Account.DoesNotExist, ValidationError, ValueError):
                await self.send(text_data=json.dumps({
                    "type": "error", "message": "کاربری با این کد پیدا نشد"
                }))
                return

            if target.pk == self.scope["user"].pk:
                await self.send(text_data=json.dumps({
                    "type": "error", "message": "این کد خودته!"
                }))
                return

            await self.send(text_data=json.dumps({
                "type": "user_found",
                "username": target.username,
                "username_key": target.key,
                "avatar": target.avatar.url if target.avatar else None,
            }))

    ########Delete Messages########

    async def delete_mass(self, text_data):
        from .models import Massage

        data = json.loads(text_data)
        message_id = data["massageId"]

        try:
            message = await sync_to_async(Massage.objects.get)(
                id=message_id,
                room=self.room,
                topic=self.topic
            )
        except Massage.DoesNotExist:
            print("MESSAGE NOT FOUND")
            return

        # Check-owner
        if message.user_id != self.scope["user"].id:
            print("NOT OWNER")
            return

        await sync_to_async(
            Massage.objects.filter(id=message_id).delete
        )()

        if self.topic_group_name:
            await self.channel_layer.group_send(
                self.topic_group_name,
                {
                    "type": "del_massage",
                    "id_massage": message_id
                }
            )

    async def del_massage(self, event):
        await self.send(
            text_data=json.dumps({
                "type": "message_deleted",
                "mass_id": event["id_massage"]
            })
        )

        async def search_user(self, data):

            from .models import User_Account

            target_key = (data.get("KEY_user") or "").strip()

            if not target_key:
                await self.send(text_data=json.dumps({
                    "type": "error", "message": "کد کاربر ارسال نشده"
                }))
                return

            try:
                target = await sync_to_async(User_Account.objects.get)(key=target_key)
            except (User_Account.DoesNotExist, ValidationError, ValueError):
                await self.send(text_data=json.dumps({
                    "type": "error", "message": "کاربری با این کد پیدا نشد"
                }))
                return

            if target.pk == self.scope["user"].pk:
                await self.send(text_data=json.dumps({
                    "type": "error", "message": "این کد خودته!"
                }))
                return

            await self.send(text_data=json.dumps({
                "type": "user_found",
                "username": target.username,
                "name": target.name,
                "bio": target.bio,
                "username_key": target.key,
                "avatar": target.avatar.url if target.avatar else None,
            }))

    ########Receive Items########

    async def receive(self, text_data):
        from .models import Massage

        print("RAW:", text_data)

        data = json.loads(text_data)
        message_type = data.get("type")

  
        if message_type == "create_direct":
            await self.create_direct(data)
            return

        if message_type == "search_user":
            await self.search_user(data)
            return

        if message_type == "create_direct":
            await self.create_direct(data)
            return

        if message_type == "search_user":
            await self.search_user(data)
            return

        if message_type == "create_direct":
            await self.create_direct(data)
            return

        if not self.topic_group_name:
            return

        if message_type == "delete_message":
            await self.delete_mass(text_data)
            return

        if message_type == "message":
            message = data.get("message")

            if not message and not data.get("mediaId"):
                return

            my_model = await sync_to_async(Massage.objects.create)(
                payam=message,
                room=self.room,
                user=self.scope["user"],
                topic=self.topic,
                file_id=data.get("mediaId"),
            )

            media_url = await self.get_media_url(my_model.id)

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
                    "avatar_user": (
                        self.scope["user"].avatar.url
                        if self.scope["user"].avatar
                        else None
                    ),
                }
            )
            return

    async def chat_topic_message(self, event):
        await self.send(
            text_data=json.dumps({
                "type": "chat_topic_message",
                "message": event["message"],
                "username": event["username"],
                "date": event["date_massage"],
                "id": event["massage_id"],
                "username_id": event["username_id"],
                "username_key": event["username_key"],
                "media_URL": event["media_URL"],
                "avatar_user": event["avatar_user"],
            })
        )