from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    path('get/', views.Look_Massage, name= 'get-massage'),
    path('post/', views.Send_Massage, name= 'send-massage'),
    path('put/', views.update_Massage, name= 'update-massage'),
    path('delete/', views.Delete_Massage, name= 'delete-massage'),
    path('sign-up/', views.Sign_Up, name= 'sign up users'),
    path('token/', TokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('upload/', views.Upload_profile, name= 'upload profile')
]

