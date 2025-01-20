from django.urls import path
from .views import DeviceConfigView

urlpatterns = [
    path('configs/', DeviceConfigView.as_view(), name='configs'),
]
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('pulsera/', views.pulsera, name='pulsera'),
    path('enchufe/', views.enchufe, name='enchufe'),
    path('save_config/', views.save_config, name='save_config'),
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('edit_profile/', views.edit_profile, name='edit_profile'),
    path('configs/', views.list_configs, name='list_configs'),

]

