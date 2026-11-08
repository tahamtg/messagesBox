from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .manager import Username_Manager
from django.utils.text import slugify
import secrets

def generate_key():
    return secrets.token_hex(10)

class User_Account(AbstractBaseUser, PermissionsMixin):

    username = models.CharField(max_length=255, unique=True)
    avatar = models.ImageField(upload_to='media_avatar/', blank=True, null=True)
    name = models.CharField(max_length=255, null=True)
    bio = models.TextField(blank=True, default="")

    account_status_online = models.BooleanField(default=True)

    key = models.CharField(
        max_length=20,
        editable=False,
        default=generate_key,
        unique=True,
    )

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = Username_Manager()

class Direct(models.Model):
    user_Direct = models.ManyToManyField(User_Account)
    created_at = models.DateTimeField(auto_now_add=True)
    key = models.CharField(
        max_length=64,
        editable=False,
        unique=True,
    )

class Room (models.Model):
    name = models.CharField(max_length=120, unique=True)

    slug = models.SlugField(
        max_length=120,
        unique=True,
        allow_unicode=True,
    )

    def __str__(self):
        return self.name


class Topic(models.Model):
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name="topics"
    )

    name = models.CharField(max_length=100)

    slug = models.SlugField(
        max_length=120,
        allow_unicode=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["room", "slug"],
                name="unique_topic_slug_per_room"
            )
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name, allow_unicode=True) or secrets.token_hex(4)
            slug = base
            number = 1

            while Topic.objects.filter(room=self.room, slug=slug).exists():
                number += 1
                slug = f"{base}-{number}"

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class MediaUpload(models.Model):
    media = models.FileField(upload_to='uploads', null=True, blank=True)

class Massage (models.Model):
    user = models.ForeignKey(User_Account, on_delete=models.CASCADE, null=True, blank=False)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    direct = models.ForeignKey(Direct, on_delete=models.CASCADE, null=True, blank=True)
    payam = models.TextField()
    publish_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)
    file = models.ForeignKey(MediaUpload, on_delete=models.SET_NULL, null=True, blank=True)
    topic = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="messages"
    )
