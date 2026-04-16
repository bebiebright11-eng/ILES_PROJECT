from django.contrib import admin
from .models import WeeklyLog, Evaluation, EvaluationCriteria, CriteriaScore


# ✅ Weekly Logs
@admin.register(WeeklyLog)
class WeeklyLogAdmin(admin.ModelAdmin):
    list_display = ('placement', 'week_number', 'attendance_days', 'submitted_at')
    list_filter = ('week_number',)


# ✅ Evaluation
@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('placement', 'supervisor', 'score', 'created_at', 'is_final')


# ✅ NEW: Evaluation Criteria
@admin.register(EvaluationCriteria)
class EvaluationCriteriaAdmin(admin.ModelAdmin):
    list_display = ('name', 'max_score')


# ✅ NEW: Criteria Scores
@admin.register(CriteriaScore)
class CriteriaScoreAdmin(admin.ModelAdmin):
    list_display = ('evaluation', 'criteria', 'score')
