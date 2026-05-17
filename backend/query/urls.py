from django.urls import path
from . import views

urlpatterns = [
    path("", views.interact_query, name="query"),
]
