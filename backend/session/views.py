from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import USPTOSession


@api_view(["POST"])
@permission_classes([AllowAny])
def set_session_key(request):
    key = request.data.get("key")
    if not key:
        return Response({"error": "key is required"}, status=status.HTTP_400_BAD_REQUEST)
    USPTOSession.set_key(key)
    return Response({"status": "ok", "message": "Session key stored"})


@api_view(["GET"])
@permission_classes([AllowAny])
def session_status(request):
    session = USPTOSession.get_active()
    return Response({"exists": session is not None})
