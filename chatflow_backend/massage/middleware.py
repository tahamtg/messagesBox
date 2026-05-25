from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from .models import User_Account
from urllib.parse import parse_qs
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model



class JWTAuthMiddleware(BaseMiddleware):
    
    async def __call__(self, scope, receive, send):
        
        query = self.scope["query_string"].decode()
        params = query.parse_qs(query)
        token = params.get("token", None)[0]

        if token:
            try:
                aceess_token = AccessToken(token)
                id_user = aceess_token["user_id"]
                user = await self.get_user(id_user)
                scope["user"] = user
            except Exception:
                scope["user"] = None
        
        return await super().__call__(scope, receive, send)

           @database_sync_to_async
           def get_user(self, userId):
                User_Account.objects.get(id=userId)