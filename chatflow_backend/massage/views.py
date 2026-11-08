from datetime import timedelta
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.decorators import parser_classes
from rest_framework.decorators import permission_classes
from rest_framework.decorators import authentication_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Massage, User_Account, Room, Direct, Topic
from .serializers import Authenticate_User, UplaodMedia, TopicSerializer

COOKIE_OPTIONS = {
    "httponly": True,
    "secure": True,
    "samesite": "Lax",
}


@api_view(["GET"])
def get_search(request):

    search = request.query_params.get("search", "").strip()

    if not search:
        return Response([])

    topics = (
        Topic.objects.filter(name__icontains=search)
        .values_list("name", flat=True)
        .distinct()[:10]
    )

    users = (
        User_Account.objects.filter(username__icontains=search)
        .values_list("username", flat=True)[:10]
    )

    data = [{"title": title} for title in [*topics, *users]]

    return Response(data)


@api_view(["GET"])
def get_topics(request, slug):

    room = Room.objects.filter(slug=slug).first()

    if not room:
        return Response([])

    topics = room.topics.all()

    return Response(TopicSerializer(topics, many=True).data)


@api_view(["POST"])
def create_topic(request, slug):

    room, created = Room.objects.get_or_create(
        slug=slug,
        defaults={
            "name": slug
        }
    )

    serializer = TopicSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(room=room)

    return Response(
        serializer.data,
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
def Pagination_data(request):

    model = User_Account.objects.order_by("id")

    paginator = Paginator(model, 5)

    page = request.GET.get("page_user")

    page_obj = paginator.get_page(page)

    data = Authenticate_User(page_obj, many=True).data

    return Response({
        "count": paginator.count,
        "pages": paginator.num_pages,
        "next_page": page_obj.next_page_number() if page_obj.has_next() else None,
        "previous_page": page_obj.previous_page_number() if page_obj.has_previous() else None,
        "resualt": data,
    })


@api_view(["GET"])
def show_another_messages(request, room_slug, topic_slug):

    room = get_object_or_404(
        Room,
        slug=room_slug
    )

    topic = get_object_or_404(
        room.topics,
        slug=topic_slug
    )

    massages = (
        Massage.objects.filter(room=room, topic=topic)
        .select_related("user", "file")
        .order_by("publish_date")
    )

    data = []

    for m in massages:
        data.append({
            "username": m.user.username if m.user else None,
            "username_id": m.user.id if m.user else None,
            "username_key": m.user.key if m.user else None,
            "message": m.payam,
            "publish_date": m.publish_date,
            "id": m.id,
            "media_URL": m.file.media.url if m.file and m.file.media else None,
            "avatar_user": m.user.avatar.url if m.user and m.user.avatar else None,
        })

    return Response(data)


@api_view(["GET"])
def get_directs(request):

    current_user = request.user

    directs = (
        Direct.objects.filter(user_Direct=current_user)
        .prefetch_related("user_Direct")
    )

    data = []

    for direct in directs:

        other_user = next(
            (u for u in direct.user_Direct.all() if u.id != current_user.id),
            None
        )

        if not other_user:
            continue

        data.append({
            "chat_key": direct.key,
            "username": other_user.username,
            "username_key": other_user.key,
            "avatar": (
                other_user.avatar.url
                if other_user.avatar
                else None
            )
        })

    return Response(data)


@api_view(["GET"])
def get_my_key(request):

    return Response({
        "key": request.user.key
    })


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def Sign_Up(request):

    get_user = Authenticate_User(data=request.data)

    get_user.is_valid(raise_exception=True)
    user = get_user.save()

    return Response(
        {
            "url_img": user.avatar.url if user.avatar else None,
            "username": user.username,
            "bio": user.bio,
        },
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
def Check_Auth(request):

    return Response({
        "authenticate": True,
        "username": request.user.username,
        "username_id": request.user.id,
        "iavatar": request.user.avatar.url if request.user.avatar else None,
        "bio": request.user.bio,
        "account_status_online": request.user.account_status_online,
    })


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def LogOut(request):

    response = Response({
        "massage" : "Logout successful!"
    })

    response.set_cookie("access", "", max_age=0, **COOKIE_OPTIONS)
    response.set_cookie("refresh", "", max_age=0, **COOKIE_OPTIONS)

    return response


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload(request):

    req = UplaodMedia(data=request.data)

    req.is_valid(raise_exception=True)

    res = req.save()

    return Response({
        "message": "Object saved",
        "data": req.data,
        "mediaUrl": res.media.url,
        "mediaUrlid": res.id
    })


@api_view(['PATCH'])
@parser_classes([MultiPartParser, FormParser])
def Update_Photo(request):

    photo = request.FILES.get('media')

    if not photo:
        return Response(
            {"error": "عکسی ارسال نشده است"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = request.user

    serializer = Authenticate_User(
        user,
        data={"avatar": photo},
        partial=True,
    )

    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response({
        "message": "عکس پروفایل با موفقیت تغییر کرد",
        "mediaUrl": user.avatar.url
    })


@api_view(['PATCH'])
def Update_Info_User(request):

    user = Authenticate_User(
        request.user,
        data=request.data,
        partial=True,
    )

    user.is_valid(raise_exception=True)
    user.save()

    return Response({
        "update_bio": "bio is update"
    })


class CreateTokenCookie(TokenObtainPairView):

    def post(self, request, *args, **kwargs):

        response = super().post(request, *args, **kwargs)

        access_token = response.data["access"]
        refresh_token = response.data["refresh"]

        response.set_cookie(
            key="access",
            value=access_token,
            max_age=86400,
            **COOKIE_OPTIONS
        )

        response.set_cookie(
            key="refresh",
            value=refresh_token,
            max_age=int(timedelta(days=60).total_seconds()),
            **COOKIE_OPTIONS
        )

        response.data = {"detail": "login successful"}

        return response
