from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):

    def authenticate(self, request):

        print("=== COOKIE AUTH START ===")
        print(request.COOKIES)

        token = request.COOKIES.get("access")

        if not token:
            return None

        validated_data = self.get_validated_token(token)
        print("User Vlidated:", validated_data)
        get_user = self.get_user(validated_data)
        print('User:', get_user)
        return (get_user, validated_data)