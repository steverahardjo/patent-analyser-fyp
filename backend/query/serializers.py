from rest_framework import serializers


class QuerySerializer(serializers.Serializer):
    question = serializers.CharField(required=True, min_length=1, max_length=2000)

    def validate_question(self, value):
        return value.strip()
