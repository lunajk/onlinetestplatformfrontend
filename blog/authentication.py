from rest_framework.authentication import BaseAuthentication 
from rest_framework.exceptions import AuthenticationFailed
from .models import CustomUser, TestUser  # Make sure TestUserToken is imported

class UserTokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Token "):
            return None  

        token = auth_header.split(" ")[1]  

        # 1. Try to find user by user_token
        try:
            user = CustomUser.objects.get(user_token=token)
            return (user, None)
        except CustomUser.DoesNotExist:
            pass

        # 2. Try to find test user token
        try:
            test_user_token = TestUser.objects.get(token=token)
            return (test_user_token.user, None)  # Make sure TestUserToken has a ForeignKey to CustomUser as `user`
        except TestUser.DoesNotExist:
            raise AuthenticationFailed("Invalid token")
