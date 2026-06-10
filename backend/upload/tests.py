from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient


class UploadAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="uploadtest", password="pass1234")
        login_res = self.client.post("/auth/login", {
            "username": "uploadtest", "password": "pass1234",
        }, format="json")
        self.token = login_res.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_upload_rejects_no_file(self):
        res = self.client.post("/upload", {}, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def _make_pdf(self, content: str = "US-12345678-A1") -> SimpleUploadedFile:
        return SimpleUploadedFile(
            "patent.pdf",
            (b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\n" + content.encode()),
            content_type="application/pdf",
        )

    def test_upload_rejects_no_patent_number(self):
        f = self._make_pdf("no patent number here")
        res = self.client.post("/upload", {"file": f}, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)

    @patch("upload.views._get_processor")
    @patch("upload.views._get_classifier")
    @patch("upload.views.PatentChatbot")
    @patch("upload.views._get_blobdb")
    @patch("upload.views._get_cosmodb")
    def test_upload_returns_session_required(
        self, mock_cosmo, mock_blob, mock_chatbot, mock_classifier, mock_processor
    ):
        from services.patent_parser import SessionKeyError
        mock_processor.return_value.process_document.side_effect = SessionKeyError()

        f = self._make_pdf()
        res = self.client.post("/upload", {"file": f}, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(res.data["error"], "session_required")

    def test_upload_rejects_non_pdf_extension(self):
        f = SimpleUploadedFile("test.txt", b"US-12345678-A1", content_type="text/plain")
        res = self.client.post("/upload", {"file": f}, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
