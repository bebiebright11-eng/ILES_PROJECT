from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    list_display = ('username', 'email', 'role','organization', 'is_staff','is_activated')
    list_filter = ('role',)

    fieldsets = UserAdmin.fieldsets + (
        ('Role Info', {'fields': ('organization','is_activated','role',)}),
    )
