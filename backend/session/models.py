from django.db import models


class USPTOSession(models.Model):
    key = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "uspto_session"

    @classmethod
    def get_active(cls) -> "USPTOSession | None":
        return cls.objects.first()

    @classmethod
    def set_key(cls, key: str) -> "USPTOSession":
        obj, _ = cls.objects.update_or_create(pk=1, defaults={"key": key})
        return obj
