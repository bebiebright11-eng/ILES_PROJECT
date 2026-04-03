from django.contrib import admin
from .models import WeeklyLog, Evaluation

@admin.register(WeeklyLog)
class WeeklyLogAdmin(admin.ModelAdmin):
    list_display = ('placement', 'week_number', 'attendance_days', 'submitted_at')
    list_filter = ('week_number',)

@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('placement', 'supervisor', 'score', 'created_at')
