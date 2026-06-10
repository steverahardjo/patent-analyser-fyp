from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.models import User


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.signup_url = "/auth/signup"
        self.login_url = "/auth/login"
        self.me_url = "/auth/me"
        self.refresh_url = "/auth/token/refresh"

    def test_signup_creates_user_and_returns_tokens(self):
        res = self.client.post(self.signup_url, {
            "username": "testuser",
            "email": "test@example.com",
            "password": "strongpass123",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)
        self.assertEqual(res.data["user"]["username"], "testuser")
        self.assertTrue(User.objects.filter(username="testuser").exists())

    def test_signup_rejects_short_password(self):
        res = self.client.post(self.signup_url, {
            "username": "user2",
            "password": "123",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_signup_rejects_duplicate_username(self):
        User.objects.create_user(username="dupuser", password="pass1234")
        res = self.client.post(self.signup_url, {
            "username": "dupuser",
            "password": "pass1234",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_tokens(self):
        User.objects.create_user(username="logintest", password="pass1234")
        res = self.client.post(self.login_url, {
            "username": "logintest",
            "password": "pass1234",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)
        self.assertEqual(res.data["user"]["username"], "logintest")

    def test_login_rejects_wrong_password(self):
        User.objects.create_user(username="logintest2", password="correctpw")
        res = self.client.post(self.login_url, {
            "username": "logintest2",
            "password": "wrongpw",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_requires_username_and_password(self):
        res = self.client.post(self.login_url, {}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_returns_authenticated_user(self):
        User.objects.create_user(username="meuser", password="pass1234")
        login_res = self.client.post(self.login_url, {
            "username": "meuser",
            "password": "pass1234",
        }, format="json")
        token = login_res.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        res = self.client.get(self.me_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["username"], "meuser")

    def test_me_rejects_unauthenticated(self):
        res = self.client.get(self.me_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh_works(self):
        User.objects.create_user(username="refreshuser", password="pass1234")
        login_res = self.client.post(self.login_url, {
            "username": "refreshuser",
            "password": "pass1234",
        }, format="json")
        refresh = login_res.data["refresh"]
        res = self.client.post(self.refresh_url, {"refresh": refresh}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)

    def test_protected_endpoints_reject_without_token(self):
        endpoints = [
            ("POST", "/upload"),
            ("POST", "/upload/agent"),
            ("GET", "/upload/reports/test.pdf"),
            ("POST", "/query"),
            ("POST", "/session/key"),
            ("GET", "/session/status"),
        ]
        for method, url in endpoints:
            if method == "GET":
                res = self.client.get(url)
            else:
                res = self.client.post(url, {}, format="json")
            self.assertEqual(
                res.status_code, status.HTTP_401_UNAUTHORIZED,
                f"{method} {url} should return 401, got {res.status_code}",
            )
