from django.contrib import admin
from .models import JobPost, Application

class JobPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'employer', 'location', 'job_type', 'gap_friendly', 'posted_at', 'is_active')
    list_filter = ('gap_friendly', 'job_type', 'location', 'employer__role', 'is_active')
    search_fields = ('title', 'description', 'employer__email', 'skill_tags')
    raw_id_fields = ('employer',)
    actions = ['mark_active', 'mark_inactive']

    def mark_active(self, request, queryset):
        queryset.update(is_active=True)
    mark_active.short_description = "Mark selected job posts as active"

    def mark_inactive(self, request, queryset):
        queryset.update(is_active=False)
    mark_inactive.short_description = "Mark selected job posts as inactive"


class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('job', 'user', 'status', 'applied_at')
    list_filter = ('status', 'job__title')
    search_fields = ('user__email', 'job__title')
    raw_id_fields = ('user', 'job')

admin.site.register(JobPost, JobPostAdmin)
admin.site.register(Application, ApplicationAdmin)

