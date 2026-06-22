from django.shortcuts import render
from .serializers import MassageBoxSerializers
from .serializers import Authenticate_User
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser 
from rest_framework.decorators import parser_classes
from rest_framework import status
from .models import Massage
from .models import User_Account
import traceback

#for post user_account and if is unique username
@api_view(['POST'])
def Sign_Up(request):

    get_user = Authenticate_User(data=request.data)
    
    get_user.is_valid(raise_exception=True)
    get_user.save()
    return Response(get_user.data, status=status.HTTP_201_CREATED)

@api_view(["GET"])
def Get_Users(request):

    users = User_Account.objects.all()
    data=[]
    for user in users:
        data.append({
            "username": user.username,
            "userid": user.id
        })
    
    return Response(data)


@api_view(['PATCH'])
@parser_classes([MultiPartParser])
def Upload_profile(request):

    auth = Authenticate_User(data= request.data, partial= True)
    if auth.is_valid():
        try:
            auth.save(user= request.user)
            return Response("profile created!", status= status.HTTP_200_OK)
        except Exception as e:
            return Response(str(e), status= status.HTTP_400_BAD_REQUEST)
    else:
       return Response({"cant_put_profile" : "profile didnt updated!"})
        
