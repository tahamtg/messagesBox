import json
import hashlib
import logging
from django.db import transaction
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import User_Account, Room, Topic, Direct, Massage, MediaUpload

logger = logging.getLogger(__name__)

MAX_MESSAGE_LENGTH = 4000


def generate_direct_key(user1, user2):

    keys = sorted([user1.key, user2.key])
    value = f"{keys[0]}:{keys[1]}"

    return hashlib.sha256(value.encode()).hexdigest()


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

        except Exception:
            logger.exception("ROOM ERROR")
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
        room, created = Room.objects.get_or_create(
            slug=slug,
            defaults={"name": slug}
        )

        return room

    @database_sync_to_async
    def get_topic(self, slug, room):
        topic, created = Topic.objects.get_or_create(
            slug=slug,
            room=room,
            defaults={"name": slug}
        )

        return topic

    @database_sync_to_async
    def find_user(self, target_key):
        user = User_Account.objects.filter(key=target_key).first()

        if not user:
            return None

        return {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "bio": user.bio,
            "key": user.key,
            "avatar": user.avatar.url if user.avatar else None
        }

    async def search_user(self, data):
        target_key = str(data.get("KEY_user") or "").strip()

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
        target_user = User_Account.objects.filter(key=target_key).first()
        current_user = User_Account.objects.filter(id=current_user_id).first()

        if not target_user or not current_user:
            return None

        if target_user.id == current_user.id:
            return None

        chat_key = generate_direct_key(
            current_user,
            target_user
        )

        with transaction.atomic():
            chat, created = Direct.objects.get_or_create(key=chat_key)

            if created:
                chat.user_Direct.add(
                    current_user,
                    target_user
                )

        return chat.key

    async def create_direct(self, data):
        target_key = str(data.get("KEY_user") or "").strip()

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
    def delete_message_from_db(self, message_id):
        try:
            message = Massage.objects.get(
                id=message_id,
                room=self.room,
                topic=self.topic
            )

        except (Massage.DoesNotExist, ValueError, TypeError):
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
        user = self.scope["user"]
        file = None

        if media_id:
            try:
                file = MediaUpload.objects.filter(id=int(media_id)).first()

            except (TypeError, ValueError):
                file = None

            if not file:
                return None

        obj = Massage.objects.create(
            payam=message,
            room=self.room,
            user=user,
            topic=self.topic,
            file=file
        )

        return {
            "id": obj.id,
            "date": obj.publish_date.isoformat(),
            "media_url": file.media.url if file and file.media else None,
            "avatar_url": user.avatar.url if user.avatar else None
        }

    async def receive(self, text_data=None, bytes_data=None):
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

        if message_type == "ping":
            await self.send_json({"type": "pong"})
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
            await self.delete_mass(data)
            return

        if message_type == "message":
            message = data.get("message") or ""
            media_id = data.get("mediaId")

            if not isinstance(message, str):
                return

            if not message and not media_id:
                return

            if len(message) > MAX_MESSAGE_LENGTH:
                await self.send_json({
                    "type": "error",
                    "message": "پیام خیلی طولانی است"
                })
                return

            try:
                my_model = await self.create_message(
                    message,
                    media_id
                )

            except Exception:
                logger.exception("CREATE MESSAGE ERROR")
                await self.send_json({
                    "type": "error",
                    "message": "ارسال پیام انجام نشد"
                })
                return

            if not my_model:
                await self.send_json({
                    "type": "error",
                    "message": "فایل ارسال‌شده معتبر نیست"
                })
                return

            await self.channel_layer.group_send(
                self.topic_group_name,
                {
                    "type": "chat_topic_message",
                    "message": message,
                    "username": self.scope["user"].username,
                    "date_massage": my_model["date"],
                    "massage_id": my_model["id"],
                    "username_id": self.scope["user"].id,
                    "media_URL": my_model["media_url"],
                    "username_key": self.scope["user"].key,
                    "avatar_user": my_model["avatar_url"]
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
