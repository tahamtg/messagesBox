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
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.pagination import PageNumberPagination
from django.core.paginator import Paginator
from .models import Room
from .serializers import UplaodMedia, TopicSerializer


#get query from searching
@api_view(["GET"])
def get_search(request):
    search = request.query_params.get("search")
    get_data = Massage.objects.filter(topic__icontains=search)
    data = []

    for searching in get_data:
        data.append({
            "title" : searching.topic
        })
    
    return Response(data)


#For GET ROOMS DATA
@api_view(["GET"])
def get_topics(request, slug):
    try:
        room = Room.objects.get(slug=slug)

    except Room.DoesNotExist:
        return Response(
            {"error": "Room not found"},
            status=404
        )
    topics = room.topics.all()
    data=[]
    for topic in topics:
        data.append(
            {
            
                "id": topic.id,
                "name": topic.name,
                "slug": topic.slug,
            
            }
            )

    return Response(data)

@api_view(["POST"])
def create_topic(request, slug):
    room = Room.objects.get(slug=slug)

    serializer = TopicSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(room=room)
        return Response(serializer.data, status=201)

    return Response(serializer.errors, status=400)

@api_view(['GET'])
def Pagination_data(request):

    model = User_Account.objects.all()

    paginator = Paginator(model, 5)

    page = request.GET.get("page_user")

    page_obj = paginator.get_page(page)
    
    data = Authenticate_User(page_obj ,many=True).data

    return Response({
        "count": paginator.count,
        "pages": paginator.num_pages,
        "next_page": page_obj.next_page_number() if page_obj.has_next() else None,
        "previous_page": page_obj.previous_page_number() if page_obj.has_previous() else None,
        "resualt": data,
    })

@api_view(['GET'])
def show_another_messages(request, room_slug, topic_slug):

    room = Room.objects.get(slug=room_slug)

    topic = room.topics.get(slug=topic_slug)

    massages = Massage.objects.filter(
        room=room,
        topic=topic
    )

    data = []

    for m in massages:
        data.append({
            "username": m.user.username,
            "username_id": m.user.id,
            "message": m.payam,
            "publish_date": m.publish_date,
            "id": m.id,
            "media_URL": m.file.media.url if m.file else None,
        })

    return Response(data)

#for post user_account and if is unique username
@api_view(['POST'])
@permission_classes([AllowAny])
def Sign_Up(request):

    access_cookie = request.COOKIES.get("access")
    refresh_cookie = request.COOKIES.get("refresh")

    get_user = Authenticate_User(data=request.data)
    
    get_user.is_valid(raise_exception=True)
    get_user.save()
    return Response(get_user.data, status=status.HTTP_201_CREATED,)


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
    print("USER:", request.user)
    print("COOKIES:", request.COOKIES)
    return Response({
        "authenticate": True,
        "username": request.user.username,
        "username_id": request.user.id,
    })

@api_view(['POST'])
def LogOut(request):

    response = Response({
        "massage" : "Logout successful!"
    })

    response.delete_cookie("access")
    response.delete_cookie("refresh")

    return response

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload(request):

    try:
        print("UPLOAD REQUEST:", request.data)
        print("FILES:", request.FILES)

        req = UplaodMedia(data=request.data)

        req.is_valid(raise_exception=True)

        res = req.save()

        print("UPLOAD SUCCESS:", res)

        return Response({
            "message": "Object saved",
            "data": req.data,
            "mediaUrl": res.media.url,
            "mediaUrlid": res.id
        })

    except Exception as e:
        print("========== UPLOAD ERROR ==========")
        traceback.print_exc()
        print("==================================")

        return Response(
            {"error": str(e)},
            status=500
        )


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
            samesite="None",
            max_age= 86400,
        )

        response.set_cookie(
            key="refresh",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="None",
            max_age= int(timedelta(days=60).total_seconds()),
        )

        return response
