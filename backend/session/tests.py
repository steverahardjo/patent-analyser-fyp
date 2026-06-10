from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient

from .models import USPTOSession


class SessionModelTests(TestCase):
    def test_set_and_get_key(self):
        USPTOSession.set_key("test-jwt-token")
        session = USPTOSession.get_active()
        self.assertIsNotNone(session)
        self.assertEqual(session.key, "test-jwt-token")

    def test_set_key_updates_existing(self):
        USPTOSession.set_key("first-key")
        USPTOSession.set_key("second-key")
        self.assertEqual(USPTOSession.objects.count(), 1)
        self.assertEqual(USPTOSession.get_active().key, "second-key")


class SessionAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="sesstest", password="pass1234")
        login_res = self.client.post("/auth/login", {
            "username": "sesstest", "password": "pass1234",
        }, format="json")
        self.token = login_res.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_set_session_key(self):
        res = self.client.post("/session/key", {"key": "my-jwt"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(USPTOSession.get_active().key, "my-jwt")

    def test_set_session_key_requires_key(self):
        res = self.client.post("/session/key", {}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_session_status_returns_false_when_empty(self):
        res = self.client.get("/session/status")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data["exists"])

    def test_session_status_returns_true_when_key_set(self):
        USPTOSession.set_key("test-key")
        res = self.client.get("/session/status")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["exists"])
