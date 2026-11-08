from django.contrib.auth import password_validation
from rest_framework import serializers
from .models import Massage, User_Account, MediaUpload, Topic

MAX_UPLOAD_SIZE = 10 * 1024 * 1024

class MassageBoxSerializers (serializers.ModelSerializer):
    class Meta:
        model = Massage
        fields = '__all__'

class UplaodMedia (serializers.ModelSerializer):
    class Meta:
        model = MediaUpload
        fields = '__all__'
        extra_kwargs = {
            "media": {"required": True, "allow_null": False}
        }

    def validate_media(self, value):
        if value.size > MAX_UPLOAD_SIZE:
            raise serializers.ValidationError("حجم فایل نباید بیشتر از ۱۰ مگابایت باشد")

        return value

class Authenticate_User (serializers.ModelSerializer):
    class Meta:
        model = User_Account
        fields = ["username", "password", "id", "avatar", "bio", "account_status_online"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def validate_password(self, value):
        password_validation.validate_password(value)

        return value

    def create(self, validated_data):
        user = User_Account.objects.create_user(
            username= validated_data['username'],
            password= validated_data['password'],
            avatar= validated_data.get('avatar'),
            bio= validated_data.get('bio', ''),
        )
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        instance = super().update(instance, validated_data)

        if password:
            instance.set_password(password)
            instance.save(update_fields=["password"])

        return instance

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ["id", "name", "slug"]
        read_only_fields = ["slug"]
