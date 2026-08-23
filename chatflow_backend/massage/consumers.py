import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):

########Connect########

    async def connect(self):
        from .models import Room, Topic

        self.room_slug = self.scope["url_route"]["kwargs"]["room_slug"]
        self.topic_slug = self.scope["url_route"]["kwargs"]["topic_slug"]

        self.topic_group_name = None

        self.room = None
        self.topic = None

        # Authentication
        user = self.scope["user"]

        if not user.is_authenticated:
            await self.close()
            return

        # Get Room
        
    # Get or Create Room
        try:
            self.room, room_created = await sync_to_async(
                Room.objects.get_or_create
            )(
                slug=self.room_slug,
                defaults={
                    "name": self.room_slug
                }
            )

            print(
                "ROOM:",
                self.room.slug,
                "CREATED:",
                room_created
            )

        except Exception as e:
            print("ROOM ERROR:", e)
            await self.close()
            return
        
        # Get Topic or Create

        try:
            self.topic, topic_created = await sync_to_async(
                Topic.objects.get_or_create
            )(
                slug=self.topic_slug,
                room=self.room,
                defaults={
                    "name": self.topic_slug,
                }
            )

            print(
                "TOPIC:",
                self.topic.slug,
                "CREATED:",
                topic_created
            )

        except Exception as e:
            print("TOPIC ERROR:", e)
            await self.close()
            return

        self.topic_group_name = (
            f"chat_room_{self.room_slug}_topic_{self.topic_slug}"
        )

        # Join Topic
        if self.topic_group_name:
            await self.channel_layer.group_add(
                self.topic_group_name,
                self.channel_name
            )

        await self.accept()

        print(
            "CONNECTED!",
            self.room_slug,
            self.topic_slug
        )

########Disconnect########

    async def disconnect(self, close_code):

        # Leave topic group
        if self.topic_group_name:
            await self.channel_layer.group_discard(
                self.topic_group_name,
                self.channel_name
            )

    async def disconnected(self, event):

        await self.send(
            text_data=json.dumps({
                "type": "disconnect",
                "message": event["message"],
                "username": event["username"],
                "1006": event["1006"],
                "1001": event["1001"],
            })
        )

 # For async file model
    @database_sync_to_async
    def get_media_url(self, message_id):

        from .models import Massage

        message = Massage.objects.select_related("file").get(
            id=message_id
        )

        if message.file:
            return message.file.media.url

        return None

########DIRECT########

    async def create_direct(self, data):

        from .models import User_Account, Direct

        current_user = self.scope["user"]
        target_user_id = data["ID_user"]

        target_user = await sync_to_async(
            User_Account.objects.get
        )(id=target_user_id)

        chat = await sync_to_async(
            lambda: Direct.objects.filter(
                user_Direct=current_user
            ).filter(
                user_Direct=target_user
            ).distinct().first()
        )()

        if not chat:

            chat = await sync_to_async(
                Direct.objects.create
            )()

            await sync_to_async(
                chat.user_Direct.add
            )(
                current_user,
                target_user
            )

        await self.send(
            text_data=json.dumps({
                "type": "chat_ID",
                "chat_id": chat.id
            })
        )

########Delete Messages########

    async def delete_mass(self, text_data):

        from .models import Massage

        data = json.loads(text_data)

        message_id = data["massageId"]

        try:
            message = await sync_to_async(
                Massage.objects.get
            )(
                id=message_id,
                room=self.room,
                topic=self.topic
            )

        except Massage.DoesNotExist:
            print("MESSAGE NOT FOUND")
            return

        # Check owner
        if message.user_id != self.scope["user"].id:
            print("NOT OWNER")
            return

        await sync_to_async(
            Massage.objects.filter(
                id=message_id
            ).delete
        )()

        # Notify topic if message belongs to topic
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

########Receive Items########

    async def receive(self, text_data):

        from .models import Massage

        print("RAW:", text_data)

        data = json.loads(text_data)

        message_type = data.get("type")

        # -------------------------
        # DIRECT CHAT
        # -------------------------

        if message_type == "create-direct":
            await self.create_direct(data)
            return

        # -------------------------
        # DELETE MESSAGE
        # -------------------------

        if message_type == "delete_message":
            await self.delete_mass(text_data)
            return


        # -------------------------
        # NORMAL ROOM MESSAGE
        # -------------------------
        if message_type == "message":

            message = data.get("message")

            if not message:
                return

            my_model = await sync_to_async(
                Massage.objects.create
            )(
                payam=message,
                room=self.room,
                user=self.scope["user"],
                topic=self.topic,
                file_id=data.get("mediaId"),
            )

            media_url = await self.get_media_url(
                my_model.id
            )

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
                "media_URL": event["media_URL"],
            })
        )