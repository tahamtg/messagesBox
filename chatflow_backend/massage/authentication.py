from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):

    def authenticate(self, request):
        print("=== AUTH START ===")

        token = request.COOKIES.get("access")
        print("TOKEN:", token)

        if not token:
            print("NO TOKEN")
            return None

        try:
            validated_token = self.get_validated_token(token)
            print("VALIDATED:", validated_token)

            user = self.get_user(validated_token)
            print("USER:", user)

            return (user, validated_token)

        except Exception as e:
            print("ERROR:", repr(e))
            return None