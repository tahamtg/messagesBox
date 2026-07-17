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

            headers = dict(scope["headers"])

            cookie = headers.get(b"cookie")

            if not cookie:
                return await self.app(scope, receive, send)

            cookie = cookie.decode()

            cookies = {}

            for item in cookie.split(";"):
                key, value = item.strip().split("=", 1)
                cookies[key] = value

            token = cookies.get("access")

            if token:
                try:
                    access = AccessToken(token)

                    user_id = access.get("user_id")

                    user = await database_sync_to_async(
                        User_Account.objects.get
                    )(id=user_id)

                    scope["user"] = user

                except (TokenError, User_Account.DoesNotExist):
                    scope["user"] = AnonymousUser()

        return await self.app(scope, receive, send)