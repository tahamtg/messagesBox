from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):

    def authenticate(self, request):

        token = request.COOKIES.get("access")

        if not token:
            return None

        validated_data = self.get_validated_token(token)

        get_user = self.get_user(validated_data)

        return (get_user, validated_data)