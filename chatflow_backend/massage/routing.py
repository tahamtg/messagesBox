from django.urls import re_path
from .consumers import ChatConsumer
print("ROUTING LOADED")
websocket_urlpatterns = [
    re_path(
    r"ws/chat/(?P<room_slug>[-\w]+)/(?P<topic_slug>[-\w]+)/$",
    ChatConsumer.as_asgi(),
),
]