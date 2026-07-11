import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import sync_to_async



class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        print("CONNECT FUNCTION CALLED")
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        user = self.scope["user"]
        if not user.is_authenticated:
            await self.close()
            return

        await self.accept()

 await self.channel_layer.group_add(
     self.room_group_name,
     self.channel_name
 )

    async def disconnect(self, close_code):

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
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

    async def create_direct(self, data):
        
        current_user = self.scope["user"]
        target_user_id = data["ID_user"]
        from .models import User_Account
        from .models import Direct
        print("USER:", self.scope["user"])

        target_user = await sync_to_async(User_Account.objects.get)(
            id=target_user_id
        )
        
        chat = await sync_to_async(
            lambda: Direct.objects.filter(user_Direct=current_user)
            .filter(user_Direct=target_user)
            .distinct()
            .first()
        )()

        if not chat:
            chat = await sync_to_async(Direct.objects.create)()
            await sync_to_async(chat. user_Direct.add)(current_user, target_user)
            print("CREATE DIRECT RECEIVED")

        await self.send(text_data=json.dumps({
            "type": "chat_ID",
            "chat_id": chat.id
        }))

    async def delete_mass(self, text_data):
        from .models import Massage

        data_del = json.loads(text_data)

        print("DELETE DATA:", data_del)

        try:
            my_message = await sync_to_async(Massage.objects.get)(
                id=data_del["massageId"]
            )
        except Massage.DoesNotExist:
            print("MESSAGE NOT FOUND")
            return


        if my_message.user_id != self.scope["user"].id:
            print("NOT OWNER")
            return

        await sync_to_async(
            Massage.objects.filter(
                id=data_del["massageId"]
            ).delete
        )()

        print("MESSAGE DELETED")

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "del_massage",
                "id_massage": data_del["massageId"]
            }
        )

    async def del_massage(self, event):
        await self.send(
            text_data=json.dumps({
                "type": "message_deleted",
                "mass_id": event["id_massage"]
            })
        )

    async def receive(self, text_data):
        from .models import Massage
        from .models import User_Account
        
        print("RAW:", text_data)

        data = json.loads(text_data)

        
        if data.get("type") == "delete_message":
            await self.delete_mass(text_data)
            return

        if data.get("type") == "create-direct":
            await self.create_direct(data)

        username_id = self.scope["user"].id
        
        if data.get("type") == "chat_message":

            print("MESSAGE:", data["message"])

            my_model = await sync_to_async(
                Massage.objects.create
            )(
                payam=data["message"],
                user=self.scope["user"]
            )

            await self.channel_layer.group_send(
                self.room_group_name,
                {

                    "type": "chat_message",
                    "message": data["message"],
                    "username": self.scope["user"].username,
                    "date_massage": my_model.publish_date.isoformat(),
                    "massage_id": my_model.id,
                    "username_id": username_id
                }
            )

    async def chat_message(self, event):

        await self.send(
            text_data=json.dumps({
                "type": "chat_message",
                "message": event["message"],
                "username": event["username"],
                "date": event["date_massage"],
                "id": event["massage_id"],
                "username_id": event["username_id"]
            })
        )