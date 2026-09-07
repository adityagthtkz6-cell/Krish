from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
import hashlib
from datetime import datetime
from models.schemas import DocumentMetadata, DocumentStatus
from services.rag_engine import rag_engine
from services.audit_service import audit_service
from services.storage_provider import storage_provider

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.get("", response_model=List[DocumentMetadata])
def list_documents():
    return rag_engine.list_documents()

@router.get("/{doc_id}", response_model=DocumentMetadata)
def get_document(doc_id: str):
    doc = rag_engine.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.post("/upload", response_model=DocumentMetadata)
async def upload_document(
    file: UploadFile = File(...),
    classification: str = Form("CONFIDENTIAL INDUSTRIAL"),
    user_role: str = Form("Lead Plant Engineer")
):
    storage_path, sha256_hash, size_bytes = await storage_provider.save_file(file)
    doc_id = f"DOC-{hashlib.md5(file.filename.encode()).hexdigest()[:6].upper()}"

    text_content = f"Sovereign Ingested Content for {file.filename}\n\n"
    ext = file.filename.split(".")[-1].upper() if "." in file.filename else "TXT"

    doc = DocumentMetadata(
        id=doc_id,
        filename=file.filename,
        file_type=ext,
        size_bytes=size_bytes,
        page_count=max(1, size_bytes // 35000),
        upload_time=datetime.now().strftime("%Y-%m-%d %H:%M"),
        classification=classification,
        sha256_hash=sha256_hash,
        status=DocumentStatus.INDEXED,
        tags=[ext, "Uploaded", "On-Premises"],
        summary=f"Locally ingested and indexed {ext} file with zero external transmission."
    )

    rag_engine.add_document(doc, text_content)

    audit_service.log_event(
        action="DOCUMENT_INGESTED_ON_PREM",
        resource=file.filename,
        user_role=user_role,
        details={"sha256": sha256_hash, "size_bytes": size_bytes, "doc_id": doc_id, "storage": storage_path}
    )

    return doc
