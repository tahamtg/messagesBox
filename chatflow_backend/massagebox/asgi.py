import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "massagebox.settings")

from django.core.asgi import get_asgi_application

django_asgi_app = get_asgi_application()

from django.conf import settings
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import OriginValidator
from massage.middleware import JWTAuthMiddleware
from massage.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": OriginValidator(
        JWTAuthMiddleware(
            URLRouter(websocket_urlpatterns)
        ),
        settings.CORS_ALLOWED_ORIGINS
    ),
})
