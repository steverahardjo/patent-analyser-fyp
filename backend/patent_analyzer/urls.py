from django.urls import path, include, re_path
from django.http import JsonResponse


def health_check(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("health", health_check, name="health"),
    path("auth/", include("accounts.urls")),
    re_path(r"^upload(?:/|$)", include("upload.urls")),
    re_path(r"^query(?:/|$)", include("query.urls")),
]
