from django.urls import path
from . import views


urlpatterns = [
    path('sign-up/', views.Sign_Up, name='sign up users'),
    path('login/', views.CreateTokenCookie.as_view(), name='login users'),
    path('check-auth/', views.Check_Auth, name='authenticate users'),
    path('logout/', views.LogOut, name='logout users'),
    path('messages/<str:room_name>/', views.show_another_messages, name='show another messages'),
    path('showUsers/', views.Pagination_data, name='show users'),
    path('Upload/', views.upload, name='upload')
]