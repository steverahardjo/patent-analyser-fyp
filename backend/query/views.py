from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from services.chatbot import PatentChatbot
from services.dtype import PatentDocument

from .serializers import QuerySerializer


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def interact_query(request):
    patent_data = request.session.get("patent_data")
    if not patent_data:
        return Response(
            {"error": "No document uploaded or processed. Please upload a PDF first."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = QuerySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    question = serializer.validated_data["question"]
    patent_doc = PatentDocument(**patent_data)

    try:
        chatbot = PatentChatbot(patent_doc)
        result = chatbot.generate_patent_answer(question)
        return Response({"answer": result}, status=status.HTTP_200_OK)
    except KeyError as ke:
        return Response({"error": str(ke)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response(
            {"error": f"Error generating response: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
