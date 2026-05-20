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
import traceback


    # For massages
@api_view(['GET'])
def Look_Massage(request):

        try:
            getdata = Massage.objects.all()
            serializer = MassageBoxSerializers(getdata, many = True)
            return Response(serializer.data, status= status.HTTP_200_OK)
        except  Exception as e:
            return Response({'not_respone_server' : str(e)}, status= status.HTTP_500_INTERNAL_SERVER_ERROR)

#FOR post massages
@api_view(['POST'])
def Send_Massage(request):
        
    serializer = MassageBoxSerializers(data= request.data)
    if serializer.is_valid():
        try:
            serializer.save(user=request.user)
            return Response(serializer.data, status= status.HTTP_201_CREATED)
        except  Exception as e:
            return Response(serializer.errors, status= status.HTTP_400_BAD_REQUEST)
                
    else:

        return Response({'error' : str(e)}, status= status.HTTP_400_BAD_REQUEST)
        
#for update massages
@api_view(['PUT'])
def update_Massage(request, pk):

    try:
        updatemassage = Massage.objects.get(pk=pk)
        updated = MassageBoxSerializers(updatemassage, data= request.data)
        if updated.is_valid():
            updated.save()
            return Response(updated.data, status= status.HTTP_200_OK)
        else:
            return Response(updated.errors, status= status.HTTP_400_BAD_REQUEST)
    except  Massage.DoesNotExist:
            return Response({'not_exist_massage' : 'پیامی یافت نشد!'}, status= status.HTTP_404_NOT_FOUND)
    except  Exception as e:
            print(traceback.format_exc())
            return Response({'not_respone_server' : str(e)}, status= status.HTTP_500_INTERNAL_SERVER_ERROR)

#for delete massages
@api_view(['DELETE'])
def Delete_Massage(request, pk):

    try:
        get_data_deleted = Massage.objects.get(pk=pk)
        get_data_deleted.delete()
        return Response({'message': 'پیام با موفقیت حذف شد'}, status= status.HTTP_200_OK)
    except Massage.DoesNotExist:
        return Response({'not_exist_delete' : 'چیزی برای حذف کردن وجود نداره'}, status= status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(traceback.format_exc())
        return Response({'server_error' : str(e)}, status= status.HTTP_500_INTERNAL_SERVER_ERROR)



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
        Response({"cant_put_profile" : "profile didnt updated!"})
        
