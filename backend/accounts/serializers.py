from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username','organization', 'email', 'role', 'first_name', 'last_name', 'phone']


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add the role inside the encrypted token
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add the role to the visible JSON response for Postman/React
        data['role'] = self.user.role
            # 🔥 ADD THIS LINE
        data['user_id'] = self.user.id
        
        return data