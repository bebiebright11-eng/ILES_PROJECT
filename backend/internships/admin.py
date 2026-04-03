from django.contrib import admin
from .models import Organization, Application, Placement

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'contact_email')
    search_fields = ('name',)

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('student', 'organization', 'status', 'applied_at')
    list_filter = ('status',)
    search_fields = ('student__username', 'organization__name')


@admin.register(Placement)
class PlacementAdmin(admin.ModelAdmin):
    list_display = (
        'student',
        'organization',
        'workplace_supervisor',
        'academic_supervisor'
    )

    search_fields = ('student__username',)
