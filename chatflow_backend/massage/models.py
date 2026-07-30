from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .manager import Username_Manager

class User_Account(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=255, unique=True)
    avatar = models.ImageField(upload_to='media_avatar/', blank=True, null=True)
    name = models.CharField(max_length=255, null=True)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = Username_Manager()

class Direct (models.Model):
    user_Direct = models.ManyToManyField(User_Account)
    craeted_at = models.DateTimeField(auto_now_add=True)

class Room (models.Model):
    name = models.CharField(max_length=50, unique=True)
    def __init__(self):
        return self.name

class Massage (models.Model):
    user = models.ForeignKey(User_Account, on_delete=models.CASCADE, null=True, blank=False)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    direct = models.ForeignKey(Direct, on_delete=models.CASCADE, null=True, blank=True)
    payam = models.TextField()
    publish_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)





    