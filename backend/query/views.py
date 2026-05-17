from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from services.chatbot import PatentChatbot

from .serializers import QuerySerializer
from upload.views import get_current_patent, get_current_chatbot, set_current_chatbot


@api_view(["POST"])
def interact_query(request):
    patent = get_current_patent()
    if not patent:
        return Response(
            {"error": "No document uploaded or processed. Please upload a PDF first."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = QuerySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    question = serializer.validated_data["question"]

    chatbot = get_current_chatbot()
    if not chatbot:
        chatbot = PatentChatbot(patent)
        set_current_chatbot(chatbot)

    try:
        result = chatbot.generate_patent_answer(question)
        return Response({"answer": result}, status=status.HTTP_200_OK)
    except KeyError as ke:
        return Response({"error": str(ke)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response(
            {"error": f"Error generating response: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
