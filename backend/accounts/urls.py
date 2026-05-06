from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UserViewSet, MyTokenObtainPairView,activate_account

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')



urlpatterns = [
    path('', include(router.urls)), 
    path('login/', MyTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('activate/', activate_account),
]