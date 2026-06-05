from django.urls import path
from . import views

urlpatterns = [
    path("key", views.set_session_key, name="set_session_key"),
    path("status", views.session_status, name="session_status"),
]
