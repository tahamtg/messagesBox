from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from rest_framework_simplejwt.exceptions import TokenError

class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        from django.contrib.auth.models import AnonymousUser
        from rest_framework_simplejwt.tokens import AccessToken
        from .models import User_Account
        print("SCOPE TYPE:", scope["type"])
        scope["user"] = AnonymousUser()
        scope["user_id"] = None

        if scope["type"] == "websocket":
            query_string = scope["query_string"].decode()
            params = parse_qs(query_string)
            token = params.get("token", [None])[0]

            if token:
                try:
                    access = AccessToken(token)
                    user_id = access.get("user_id")

                    if user_id:
                        scope["user_id"] = user_id
                        scope["user"] = await database_sync_to_async(
                            User_Account.objects.get
                        )(id=user_id)

                except TokenError:
                    print("Invalid token")
                except Exception as e:
                    print("JWT ERROR:", e)

        return await self.app(scope, receive, send)