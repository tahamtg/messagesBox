import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Massage

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_name = "general"
        self.room_group_name = f"chat_{self.room_name}"
    
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        user = self.scope["user"]
        if not user:
            self.close()
            return

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
            
        await self.channel_layer.group_send(
            self.room_group_name,
                {
                    "type" : "disconnected",
                    "message" : "internet is disconnected!"
                    "username" : self.scope["user"].username
                    "1006" : close_code == 1006
                    "1001" : close_code == 1001
                }
            )
            
    async def disconnected(self, event):
        await self.send(
            json.dumps({
                "message" : event["massage"]
                "username": event["username"]
                "1006" : event["1006"]
                "1001" : event["1001"]
            })
        )

    
    async def receive(self, text_data):
        data = json.loads(text_data)
        massage = data
        my_model = await sync_to_async(
            Massage.objects.create)(
                payam=massage["message"],
                user=self.scope["user"]
                )

        await channel_layer.group_send(
            self.room_group_name,
            {
                "type" : "chat_message",
                "massage" : massage["message"],
                "username" : self.scope["user"].username,
                "massage_id" : my_model.id,
                "date_massage" : my_model.publish_date,
                "token" : token
            }
        )

    async def chat_message(self, event):
        
        massage = event["massage"]
        username = event["username"]
        userID = event["massage_id"]
        date = event["date_massage"]

        await self.send(
            text_data=json.dumps({
                "massage": massage,
                "username" : username,
                "id" : userID,
                "date" : date
            })
        )



    