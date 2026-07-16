from channels.db import database_sync_to_async


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

            for i in cookie.split(";"):

                key, value = i.strip().split("=", 1)

                cookies[key] = value


            token = cookies.get("access")


            if token:

                access = AccessToken(token)

                user_id = access["user_id"]


                user = await database_sync_to_async(
                    User_Account.objects.get
                )(id=user_id)


                scope["user"] = user


        return await self.app(scope, receive, send)