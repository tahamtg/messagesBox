from rest_framework import serializers
from .models import Massage, User_Account, MediaUpload

class MassageBoxSerializers (serializers.ModelSerializer):
    class Meta:
        model = Massage
        fields = '__all__'

class UplaodMedia (serializers.ModelSerializer):
    class Meta:
        model = MediaUpload
        fields = '__all__'

class Authenticate_User (serializers.ModelSerializer):
    class Meta:
        model = User_Account
        fields = ["username", "password", "id"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self, validated_data):
        user = User_Account.objects.create_user(
            username= validated_data['username'],
            password= validated_data['password']
        )
        return user