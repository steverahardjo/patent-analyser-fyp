import os
import uuid
from typing import Optional
from azure.cosmos import CosmosClient
from azure.storage.blob import BlobServiceClient
from services.dtype import CosmoDBDocument
from dotenv import load_dotenv

# Load .env if present
load_dotenv()


class BlobStore:
    def __init__(self, container_name: str = "patent-files"):
        self.connection_string = os.getenv("AZURE_BLOB_STRING")
        if not self.connection_string:
            raise ValueError("AZURE_BLOB_CONNECTION_STRING not set in environment.")
        
        self.container_name = container_name
        self.blob_service_client = BlobServiceClient.from_connection_string(self.connection_string)
        self.container_client = self.blob_service_client.get_container_client(container_name)

    def upload_blob(self, blob_name: str, data: bytes, overwrite: bool = True) -> str:
        blob_client = self.container_client.get_blob_client(blob_name)
        blob_client.upload_blob(data, overwrite=overwrite)
        return blob_client.url

    def download_blob(self, blob_name: str) -> bytes:
        blob_client = self.container_client.get_blob_client(blob_name)
        return blob_client.download_blob().readall()

    def delete_blob(self, blob_name: str):
        blob_client = self.container_client.get_blob_client(blob_name)
        blob_client.delete_blob()


class CosmosPatentStore:
    def __init__(
        self,
        database_name: str = "cosmicworks",
        container_name: str = "patent-store",
    ):
        self.connection_string = os.getenv("COSMODB_STRING")
        if not self.connection_string:
            raise ValueError("Cosmo String is not set in environment.")
        
        self.client = CosmosClient.from_connection_string(self.connection_string)
        self.database = self.client.get_database_client(database_name)
        self.container = self.database.get_container_client(container_name)

    def insert_document(self, document: CosmoDBDocument):
        data = document.dict()
        if "id" not in data:
            patent_id = getattr(document.patent, "id", None)
            data["id"] = patent_id if patent_id else str(uuid.uuid4())
        self.container.create_item(body=data)

    def get_document(self, patent_id: str) -> Optional[CosmoDBDocument]:
        query = "SELECT * FROM c WHERE c.patent.id = @patent_id"
        parameters = [{"name": "@patent_id", "value": patent_id}]
        
        results = list(self.container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))

        if not results:
            return None

        return CosmoDBDocument(**results[0])
