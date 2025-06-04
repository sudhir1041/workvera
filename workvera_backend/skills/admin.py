from django.contrib import admin
from .models import Skill, SkillTest, SkillResult

class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

class SkillTestAdmin(admin.ModelAdmin):
    list_display = ('title', 'skill', 'created_at')
    list_filter = ('skill',)
    search_fields = ('title', 'description', 'skill__name')
    autocomplete_fields = ['skill'] 

class SkillResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'test', 'score', 'submitted_at')
    list_filter = ('test__skill', 'test')
    search_fields = ('user__email', 'test__title')
    raw_id_fields = ('user', 'test') 

admin.site.register(Skill, SkillAdmin)
admin.site.register(SkillTest, SkillTestAdmin)
admin.site.register(SkillResult, SkillResultAdmin)
