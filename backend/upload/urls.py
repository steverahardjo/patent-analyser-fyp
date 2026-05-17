from django.urls import path
from . import views

urlpatterns = [
    path("", views.upload_pdf, name="upload"),
    path("agent", views.upload_pdf_agent, name="upload_agent"),
    path("reports/<str:filename>", views.download_report, name="download_report"),
]
