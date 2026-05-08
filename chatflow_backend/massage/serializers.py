from rest_framework import serializers
from .models import Massage, User_Account

class MassageBoxSerializers (serializers.ModelSerializer):
    class Meta:
        model = Massage
        fields = '__all__'

class Authenticate_User (serializers.ModelSerializer):
    class Meta:
        model = User_Account
        fields = '__all__'

    def create(self, validated_data):
        user = User_Account.object.create_user(
            username= validated_data['username'],
            password= validated_data['password']
        )
        return user
    

