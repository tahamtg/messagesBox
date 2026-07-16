from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    path('sign-up/', views.Sign_Up, name= 'sign up users'),
    path('login/', CreateTokenCookie.as_view(), name= 'login users'),
    path('check-auth/', views.Check_Auth, name='athuneticate users'),
    path('logout/', views.LogOut, name='logout users'),
]   


