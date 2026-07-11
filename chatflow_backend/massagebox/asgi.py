import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "massagebox.settings")

from django.core.asgi import get_asgi_application

django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from massage.routing import websocket_urlpatterns
from massage.middleware import JWTAuthMiddleware

print("ASGI LOADED")
print(websocket_urlpatterns)

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})