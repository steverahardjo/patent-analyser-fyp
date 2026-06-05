import os
import re

from django.http import FileResponse
from pydantic import ValidationError
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from services.agent import PatentAnalysisAgent
from services.patent_parser import DocProcessing, SessionKeyError
from services.textClassification import PatentClassifier
from services.LLM import Openai
from services.chatbot import PatentChatbot
from services.dtype import CosmoDBDocument
from services.db import BlobStore, CosmosPatentStore
from session.models import USPTOSession

from .serializers import FileUploadSerializer

PATENT_NUM_PATTERN = re.compile(
    rb"(?:US[-\s]*)(\d{5,11})(?:[-\s]*A1)?", re.IGNORECASE
)
TEXT_PATTERN = re.compile(
    r"(?:US[-\s]*)(\d{5,11})(?:[-\s]*A1)?", re.IGNORECASE
)

_classifier = None
_agent = None
_cosmodb = None
_blobdb = None

_patent = None
_chatbot = None


def _get_processor():
    session = USPTOSession.get_active()
    key = session.key if session else None
    return DocProcessing(session_key=key)


def _get_classifier():
    global _classifier
    if _classifier is None:
        _classifier = PatentClassifier(Openai("OPENAI_KEY"))
    return _classifier


def _get_agent():
    global _agent
    if _agent is None:
        _agent = PatentAnalysisAgent(_get_classifier())
    return _agent


def _get_cosmodb():
    global _cosmodb
    if _cosmodb is None:
        _cosmodb = CosmosPatentStore("cosmicworks", "patent-store")
    return _cosmodb


def _get_blobdb():
    global _blobdb
    if _blobdb is None:
        _blobdb = BlobStore("patent-file")
    return _blobdb


def get_current_patent():
    return _patent


def get_current_chatbot():
    return _chatbot


def set_current_chatbot(cb):
    global _chatbot
    _chatbot = cb


def set_current_patent(p):
    global _patent
    _patent = p


@api_view(["POST"])
def upload_pdf(request):
    serializer = FileUploadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    file = serializer.validated_data["file"]
    content = file.read()

    if not content:
        return Response({"error": "Empty file content"}, status=status.HTTP_400_BAD_REQUEST)

    extracted_num = _extract_patent_number(content)
    if not extracted_num:
        return Response(
            {
                "error": "Patent number not found",
                "debug": "Tried patterns: US-<digits>-A1 and standalone 5-11 digit numbers",
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    try:
        patent_doc = _get_processor().process_document(extracted_num)
        raw_result = _get_classifier().classify_patent(patent_doc.abstract, patent_doc.claims)
        summarization = _get_classifier().summarization(patent_doc)
        suggested_questions = _get_classifier().generate_suggested_questions(
            summarization + raw_result.final_classification
        )

        set_current_patent(patent_doc)

        chatbot = PatentChatbot(patent_doc)
        chunks = chatbot.init_chatbot(patent_doc)
        set_current_chatbot(chatbot)

        cosmo_doc = CosmoDBDocument(patent=patent_doc, chunks=chunks)
        cosmo_doc.pdf_blob(_get_blobdb().upload_blob(file))
        _get_cosmodb().insert_document(cosmo_doc)

        return Response(
            {
                "message": "PDF processed and classified successfully",
                "patent_number": extracted_num,
                "title": patent_doc.title,
                "Inventors": patent_doc.inventor,
                "publication_date": patent_doc.publication_date,
                "classification_result": raw_result.final_classification,
                "summ": summarization,
                "suggested_questions": suggested_questions,
            },
            status=status.HTTP_200_OK,
        )

    except SessionKeyError:
        return Response(
            {"error": "session_required", "message": "USPTO session key missing or expired. Please provide a new one via POST /session/key"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    except ValidationError as ve:
        return Response(
            {"error": "Validation failed", "details": ve.errors()},
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )
    except Exception as e:
        return Response(
            {"error": f"Error during processing/classification: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def upload_pdf_agent(request):
    serializer = FileUploadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    file = serializer.validated_data["file"]
    content = file.read()

    if not content:
        return Response({"error": "Empty file content"}, status=status.HTTP_400_BAD_REQUEST)

    extracted_num = _extract_patent_number(content)
    if not extracted_num:
        return Response(
            {
                "error": "Patent number not found",
                "debug": "Tried patterns: US-<digits>-A1 and standalone 5-11 digit numbers",
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    try:
        patent_doc = _get_processor().process_document(extracted_num)
        agent = _get_agent()
        agent_result = agent.run(
            patent_doc,
            patent_doc.abstract,
            patent_doc.claims,
        )

        return Response(
            {
                "message": "Patent analyzed by AI agent",
                "patent_number": extracted_num,
                "title": patent_doc.title,
                "inventors": patent_doc.inventor,
                "publication_date": patent_doc.publication_date,
                "classification": agent_result["pipeline"].get("classification"),
                "summary": agent_result["pipeline"].get("summary"),
                "suggested_questions": agent_result["pipeline"].get("questions"),
                "pdf_report": agent_result["pipeline"].get("pdf"),
                "agent_trace": agent_result["messages"],
            },
            status=status.HTTP_200_OK,
        )

    except SessionKeyError:
        return Response(
            {"error": "session_required", "message": "USPTO session key missing or expired. Please provide a new one via POST /session/key"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    except ValidationError as ve:
        return Response(
            {"error": "Validation failed", "details": ve.errors()},
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )
    except Exception as e:
        return Response(
            {"error": f"Error during agent processing: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def download_report(request, filename: str):
    from services.pdf_generator import REPORTS_DIR
    filepath = os.path.join(REPORTS_DIR, filename)
    if not os.path.exists(filepath):
        return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)
    return FileResponse(open(filepath, "rb"), as_attachment=True, filename=filename)


def _extract_patent_number(content: bytes) -> str | None:
    match = PATENT_NUM_PATTERN.search(content)
    if match:
        return match.group(1).decode("utf-8")

    try:
        sample = content[:10240].decode("utf-8", errors="ignore")
        text_match = TEXT_PATTERN.search(sample)
        if text_match:
            return text_match.group(1)
        alt_match = re.search(r"(\d{5,11})", sample)
        if alt_match:
            return alt_match.group(1)
    except Exception:
        pass

    return None
