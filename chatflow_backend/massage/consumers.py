import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import sync_to_async



class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        query_string = self.scope["query_string"].decode()
        print("QUERY:", query_string)
        print("USER:", self.scope["user"])
        print("AUTH:", self.scope["user"].is_authenticated)

        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

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

    async def get_id_user(self, text_data):
        from .models import User_Account
        from .models import Direct
        id_user = json.loads(text_data)
        print("get user!", id_user)

        current_user = self.scope["user"]
        target_user_id = id_user["ID_user"]

        target_user  = await sync_to_async(User_Account.objects.get)(id=target_user_id)
        direct = return await sync_to_async(Direct.objects.create)()

        chat = await sync_to_async(Direct.objects.filter
        (user_Direct=current_user)
        .filter(user_Direct=target_user)
        .first)()

        if chat:
            return chat;
        
        chat = await sync_to_async(direct.user_Direct.add)(current_user, target_user_id)

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

        print("RAW:", text_data)

        data = json.loads(text_data)

        
        if data.get("type") == "delete_message":
            await self.delete_mass(text_data)
            return

        
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
                    "massage_id": my_model.id
                }
            )

    async def chat_message(self, event):

        await self.send(
            text_data=json.dumps({
                "type": "chat_message",
                "message": event["message"],
                "username": event["username"],
                "date": event["date_massage"],
                "id": event["massage_id"]
            })
        )