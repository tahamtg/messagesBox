import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_name = "general"
        self.room_group_name = f"chat_{self.room_name}"
    
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

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
        massage = data["message"]
        await channel_layer.group_send(
            self.room_group_name,
            {
                "type" : "chat_message",
                "massage" : massage,
                "username" : self.scope["user"].username
            }
        )

    async def chat_message(self, event):
        
        massage = event["massage"]
        username = event["username"]

        await self.send(
            text_data=json.dumps({
                "massage": massage,
                "username" : username
            })
        )



    