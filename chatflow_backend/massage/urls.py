from django.urls import path
from .views import CreateTokenCookie
from . import views


urlpatterns = [
    path('sign-up/', views.Sign_Up, name='sign up users'),
    path('login/', CreateTokenCookie.as_view(), name='login users'),
    path('check-auth/', views.Check_Auth, name='authenticate users'),
    path('logout/', views.LogOut, name='logout users'),
]