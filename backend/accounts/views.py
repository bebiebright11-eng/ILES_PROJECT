from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserSerializer, MyTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        #  Only admin sees all users
        if user.role == "admin":
            return User.objects.all()

        # Others see only themselves
        return User.objects.filter(id=user.id)


from rest_framework_simplejwt.views import TokenObtainPairView

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer



from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes,authentication_classes

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def activate_account(request):
    username = request.data.get("username")
    password = request.data.get("password")
    first_name = request.data.get("first_name")
    last_name = request.data.get("last_name")

    if not username or not password or not first_name or not last_name:
        return Response({"error": "All fields are required"}, status=400)

    # Check user exists
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    # Check if already activated
    if user.is_activated:
        return Response({"error": "Account already activated"}, status=400)

    
    # Set password and names
    user.set_password(password)
    user.first_name = first_name
    user.last_name = last_name
    user.is_activated = True
    user.save()

    return Response({"message": "Account activated successfully"})
