from django.urls import path
from . import views

urlpatterns = [
    path('sign-up/', views.Sign_Up, name='sign up users'),
    path('login/', views.CreateTokenCookie.as_view(), name='login users'),
    path('check-auth/', views.Check_Auth, name='authenticate users'),
    path('logout/', views.LogOut, name='logout users'),
    path('showUsers/', views.Pagination_data, name='show users'),
    path('Upload/', views.upload, name='upload'),
    path(
    "<slug:room_slug>/<slug:topic_slug>/",
    views.show_another_messages
    ),
    path("<slug:slug>/topics/", views.get_topics, name="get topics"),
    path("<slug:slug>/topics/create/", views.create_topic, name="create topic"),
    path("post-topic/", views.create_topic),
    path("searching/", views.get_search),
]