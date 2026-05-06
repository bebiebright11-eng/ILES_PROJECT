from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username','organization', 'email', 'role', 'first_name', 'last_name', 'phone']
        def create(self, validated_data):
        # Create user without password (activation will handle it)
            user = User.objects.create(**validated_data)
            user.is_activated = False  # ensure activation required
            user.set_unusable_password()  # prevent login before activation
            user.save()
            return user


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
         # Block login if not activated
        if not self.user.is_activated:
            raise serializers.ValidationError("Account not activated. Please activate first.")
        # Add the role to the visible JSON response for Postman/React
        data['role'] = self.user.role
            # ADD THIS LINE
        data['user_id'] = self.user.id

        data['first_name'] = self.user.first_name
        data['last_name'] = self.user.last_name
        
        return data