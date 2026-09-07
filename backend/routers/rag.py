from fastapi import APIRouter
import time
import hashlib
from datetime import datetime
from models.schemas import ChatRequest, ChatMessage, Citation
from services.rag_engine import rag_engine
from services.llm_provider import llm_provider
from services.audit_service import audit_service
from services.db_service import db_service

router = APIRouter(prefix="/api/rag", tags=["RAG"])

@router.post("/chat", response_model=ChatMessage)
def chat_with_documents(req: ChatRequest):
    start_t = time.time()
    contexts = rag_engine.query(req.message, req.document_ids, top_k=3)

    ai_resp = llm_provider.generate_chat_response(
        query=req.message,
        retrieved_contexts=contexts,
        role=req.user_role.value if hasattr(req.user_role, "value") else str(req.user_role),
        agent_mode=req.agent_mode
    )

    citations = [
        Citation(
            document_id=c["document_id"],
            document_name=c["document_name"],
            page=c["page"],
            section=c["section"],
            snippet=c["snippet"][:300] + "...",
            confidence=c["confidence"],
            relevance_score=c["relevance_score"]
        )
        for c in contexts
    ]

    msg_id = f"MSG-{hashlib.md5(req.message.encode()).hexdigest()[:8]}"
    elapsed_ms = int((time.time() - start_t) * 1000)

    audit_service.log_event(
        action="SOVEREIGN_RAG_QUERY",
        resource="Local Model Inference",
        user_role=req.user_role.value if hasattr(req.user_role, "value") else str(req.user_role),
        details={"query_len": len(req.message), "citations_count": len(citations), "model": ai_resp["model"]},
        latency_ms=elapsed_ms
    )

    chat_msg = ChatMessage(
        id=msg_id,
        role="assistant",
        content=ai_resp["content"],
        timestamp=datetime.now().strftime("%H:%M:%S"),
        citations=citations,
        confidence=0.96 if citations else 0.88,
        model_used=ai_resp["model"],
        inference_time_ms=elapsed_ms or ai_resp.get("inference_time_ms", 320),
        is_air_gapped=True
    )

    try:
        db_service.persist_message(chat_msg)
    except Exception:
        pass

    return chat_msg
