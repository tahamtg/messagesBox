from channels.db import database_sync_to_async
from rest_framework_simplejwt.exceptions import TokenError

class JWTAuthMiddleware:

    def __init__(self, app):
        self.app = app


    async def __call__(self, scope, receive, send):
        from django.contrib.auth.models import AnonymousUser
        from rest_framework_simplejwt.tokens import AccessToken
        from .models import User_Account

        scope["user"] = AnonymousUser()

        if scope["type"] == "websocket":

            header = dic(scope['headers'])
            cookie = header.get(b"cookie")
            cookie = cookie.decode()
            if not cookie:
                return await self.app(scope, receive, send)
            cookies ={}
            for items in cookie.split(";"):
                key, value = cookie.strip().split('=', 1)
                cookies[key] = value
            token = cookies["access"]

            try:

                access = token.AccessToken(token)
            
            except TokenError:

                scope["user"] = AnonymousUser()
                return await self.app(scope, receive, send)
            
            user_id = access["user_id"]

            userid = database_sync_to_async(User_Account.get)(
                id=user_id
            )

            scope["user"] = userid



        return await self.app(scope, receive, send)