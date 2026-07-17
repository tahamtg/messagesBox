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
from rest_framework_simplejwt.views import TokenObtainPairView
from datetime import timedelta
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes


#for post user_account and if is unique username
@api_view(['POST'])
def Sign_Up(request):

    get_user = Authenticate_User(data=request.data)
    
    get_user.is_valid(raise_exception=True)
    get_user.save()
    return Response(get_user.data, status=status.HTTP_201_CREATED)


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def Check_Auth(request):
    return Response({
        "authenticate": True,
        "username": request.user.username
    })

@api_view(['POST'])
def LogOut(request):

    response = Response({
        "massage" : "Logout successful!"
    })

    response.delete_cookie("access")
    response.delete_cookie("refresh")

    return response

class CreateTokenCookie(TokenObtainPairView):

    
    def post(self, request, *args, **kwargs):

        print("LOGIN DATA:", request.data)
        
        response = super().post(request, *args, **kwargs)

        print("TOKEN RESPONSE:", response.data)
        
        access_token = response.data["access"]
        refresh_token = response.data["refresh"]

        response.set_cookie(
            key="access",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="Strict",
            max_age= 3600,
        )

        response.set_cookie(
            key="refresh",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="Strict",
            max_age= int(timedelta(days=60).total_seconds()),
        )

        return response
