from http.cookies import SimpleCookie, CookieError
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken
from .models import User_Account


class JWTAuthMiddleware:

    def __init__(self, app):
        self.app = app

    @database_sync_to_async
    def get_user(self, user_id):
        return User_Account.objects.filter(
            id=user_id,
            is_active=True
        ).first()

    async def __call__(self, scope, receive, send):
        if scope["type"] != "websocket":
            return await self.app(scope, receive, send)

        scope["user"] = AnonymousUser()

        headers = dict(scope["headers"])
        raw_cookie = headers.get(b"cookie", b"").decode()

        cookies = SimpleCookie()

        try:
            cookies.load(raw_cookie)

        except CookieError:
            return await self.app(scope, receive, send)

        token = cookies.get("access")

        if token:
            try:
                access = AccessToken(token.value)
                user = await self.get_user(access.get("user_id"))

            except TokenError:
                user = None

            if user:
                scope["user"] = user

        return await self.app(scope, receive, send)
