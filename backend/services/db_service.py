import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from database import SessionLocal
from models.db_models import Document, DocumentChunk, Message, AgentRun, AuditLog
from models.schemas import DocumentMetadata, ChatMessage, AgentExecution, AuditEvent

logger = logging.getLogger("indra.db_service")

class DatabaseService:
    def persist_document(self, doc_meta: DocumentMetadata, text_content: str, chunks_data: List[Dict[str, Any]] = None):
        """Persist document and its chunks in PostgreSQL / SQLite."""
        db = SessionLocal()
        try:
            existing = db.query(Document).filter(Document.id == doc_meta.id).first()
            if not existing:
                doc = Document(
                    id=doc_meta.id,
                    filename=doc_meta.filename,
                    file_type=doc_meta.file_type,
                    size_bytes=doc_meta.size_bytes,
                    page_count=doc_meta.page_count,
                    upload_time=doc_meta.upload_time,
                    classification=doc_meta.classification,
                    sha256_hash=doc_meta.sha256_hash,
                    status=doc_meta.status.value if hasattr(doc_meta.status, "value") else str(doc_meta.status),
                    tags=doc_meta.tags,
                    summary=doc_meta.summary,
                    chunks_count=doc_meta.chunks_count
                )
                db.add(doc)
                db.commit()

            # Insert chunks
            if chunks_data:
                for idx, c in enumerate(chunks_data):
                    chunk_id = f"{doc_meta.id}_chk_{idx}"
                    if not db.query(DocumentChunk).filter(DocumentChunk.id == chunk_id).first():
                        chunk = DocumentChunk(
                            id=chunk_id,
                            document_id=doc_meta.id,
                            chunk_index=idx,
                            page=c.get("page", 1),
                            section=c.get("section", ""),
                            text=c.get("text", "")
                        )
                        db.add(chunk)
                db.commit()
        except Exception as e:
            db.rollback()
            logger.warning(f"Notice during document DB persistence: {e}")
        finally:
            db.close()

    def persist_message(self, msg: ChatMessage, conversation_id: Optional[str] = None):
        db = SessionLocal()
        try:
            db_msg = Message(
                id=msg.id,
                conversation_id=conversation_id,
                role=msg.role,
                content=msg.content,
                timestamp=msg.timestamp,
                citations=[c.dict() if hasattr(c, "dict") else c for c in msg.citations],
                confidence=msg.confidence,
                model_used=msg.model_used,
                inference_time_ms=msg.inference_time_ms,
                is_air_gapped=msg.is_air_gapped
            )
            db.add(db_msg)
            db.commit()
        except Exception as e:
            db.rollback()
            logger.warning(f"Notice during message DB persistence: {e}")
        finally:
            db.close()

    def persist_agent_run(self, execution: AgentExecution):
        db = SessionLocal()
        try:
            existing = db.query(AgentRun).filter(AgentRun.id == execution.id).first()
            if existing:
                existing.status = execution.status
                existing.current_step = execution.current_step
                existing.final_output = execution.final_output
                existing.hitl_status = execution.hitl_status
                existing.hitl_signed_by = execution.hitl_signed_by
                existing.hitl_signature_hash = execution.hitl_signature_hash
                existing.hitl_comments = execution.hitl_comments
            else:
                run = AgentRun(
                    id=execution.id,
                    agent_id=execution.agent_id,
                    agent_name=execution.agent_name,
                    document_id=execution.document_id,
                    document_name=execution.document_name,
                    status=execution.status,
                    current_step=execution.current_step,
                    total_steps=execution.total_steps,
                    steps_json=[s.dict() if hasattr(s, "dict") else s for s in execution.steps],
                    final_output=execution.final_output,
                    hitl_required=execution.hitl_required,
                    hitl_status=execution.hitl_status,
                    hitl_signed_by=execution.hitl_signed_by,
                    hitl_signature_hash=execution.hitl_signature_hash,
                    hitl_comments=execution.hitl_comments
                )
                db.add(run)
            db.commit()
        except Exception as e:
            db.rollback()
            logger.warning(f"Notice during agent run DB persistence: {e}")
        finally:
            db.close()

    def persist_audit_log(self, event: AuditEvent):
        db = SessionLocal()
        try:
            existing = db.query(AuditLog).filter(AuditLog.id == event.id).first()
            if not existing:
                log_entry = AuditLog(
                    id=event.id,
                    timestamp=event.timestamp,
                    user_role=event.user_role,
                    action=event.action,
                    resource=event.resource,
                    ip_address=event.ip_address,
                    status=event.status,
                    external_egress_bytes=event.external_egress_bytes,
                    latency_ms=event.latency_ms,
                    data_hash=event.data_hash,
                    details_json=event.details
                )
                db.add(log_entry)
                db.commit()
        except Exception as e:
            db.rollback()
            logger.warning(f"Notice during audit log DB persistence: {e}")
        finally:
            db.close()

db_service = DatabaseService()
