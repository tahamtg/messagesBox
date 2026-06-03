from urllib.parse import parse_qs
from rest_framework_simplejwt.tokens import AccessToken
from channels.db import database_sync_to_async
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth.models import AnonymousUser # Import necessary
from .models import User_Account # Assuming User_Account is in the same app

@database_sync_to_async
def get_user(userID):
    try:
        my_model = User_Account.objects.get(id=userID)
        return my_model
    except User_Account.DoesNotExist:
        return AnonymousUser()
    except Exception as e:
        print(f"Error fetching user {userID}: {e}")
        return AnonymousUser()

class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        scope["user"] = AnonymousUser()
        scope["user_id"] = None

        if scope['type'] == 'websocket' and scope["query_string"]:
            query_string = scope["query_string"].decode()
            params = parse_qs(query_string)
            token = params.get("token", [None])[0]

            if token:
                try:
                    access = AccessToken(token)
                    user_id = access.get("user_id")
                    if user_id:
                        scope["user_id"] = user_id
                        user = await get_user(user_id)
                        scope["user"] = user
                except TokenError:
                    print("Invalid token provided.")
                    pass
                except Exception as e:
                    print(f"Error processing token: {e}")
                    pass

    
        return await self.app(scope, receive, send)
