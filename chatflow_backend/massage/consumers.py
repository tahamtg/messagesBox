import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import sync_to_async


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        channel_layer = get_channel_layer()
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        user = self.scope["user"]
        print(user.is_authenticated)
        await self.accept()
        await self.send(text_data="connected")

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        print(self.scope)

    async def disconnect(self, close_code):
        channel_layer = get_channel_layer()

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "disconnected",
                "message": "internet is disconnected!",
                "username": self.scope["user"].username,
                "1006": close_code == 1006,
                "1001": close_code == 1001
            }
        )

    async def disconnected(self, event):
        await self.send(
            text_data=json.dumps({
                "message": event["message"],
                "username": event["username"],
                "1006": event["1006"],
                "1001": event["1001"]
            })
        )

    async def receive(self, text_data):
        from .models import Massage

        channel_layer = get_channel_layer()
        data = json.loads(text_data)
        massage = data
        print('massage:' massage["message"])

        my_model = await sync_to_async(Massage.objects.create)(
            payam=massage["message"],
            user=self.scope["user"]
        )

        await channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": massage["message"],
                "username": self.scope["user"].username,
                "massage_id": my_model.id,
                "date_massage": my_model.publish_date
            }
        )

    async def chat_message(self, event):
        massage = event["message"]
        username = event["username"]
        userID = event["massage_id"]
        date = event["date_massage"]

        await self.send(
            text_data=json.dumps({
                "message": massage,
                "username": username,
                "id": userID,
                "date": date
            })
        )
