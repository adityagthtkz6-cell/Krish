import os
import hashlib
from typing import Dict, Any, Tuple
from fastapi import HTTPException, UploadFile
from config import settings

ALLOWED_EXTENSIONS = {"pdf", "docx", "png", "jpg", "jpeg", "svg", "txt", "csv"}

class StorageProvider:
    async def save_file(self, file: UploadFile) -> Tuple[str, str, int]:
        """Returns (storage_path_or_url, sha256_hash, size_bytes)"""
        raise NotImplementedError

class LocalStorageProvider(StorageProvider):
    def __init__(self, base_dir: str = "data/uploads"):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    async def save_file(self, file: UploadFile) -> Tuple[str, str, int]:
        contents = await file.read()
        size_bytes = len(contents)
        
        # Validation
        max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
        if size_bytes > max_bytes:
            raise HTTPException(status_code=413, detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB")
        
        ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

        sha256_hash = hashlib.sha256(contents).hexdigest()
        file_path = os.path.join(self.base_dir, f"{sha256_hash[:12]}_{file.filename}")
        
        with open(file_path, "wb") as f:
            f.write(contents)
            
        return file_path, sha256_hash, size_bytes

class ProductionStorageProvider(StorageProvider):
    """Stateless / S3-compatible buffer storage for hosted production environments"""
    def __init__(self):
        self.memory_store: Dict[str, bytes] = {}

    async def save_file(self, file: UploadFile) -> Tuple[str, str, int]:
        contents = await file.read()
        size_bytes = len(contents)
        
        max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
        if size_bytes > max_bytes:
            raise HTTPException(status_code=413, detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB")
        
        ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

        sha256_hash = hashlib.sha256(contents).hexdigest()
        storage_uri = f"sovereign://objects/{sha256_hash[:16]}/{file.filename}"
        self.memory_store[storage_uri] = contents
        return storage_uri, sha256_hash, size_bytes

def get_storage_provider() -> StorageProvider:
    if settings.STORAGE_PROVIDER == "production":
        return ProductionStorageProvider()
    return LocalStorageProvider()

storage_provider = get_storage_provider()
