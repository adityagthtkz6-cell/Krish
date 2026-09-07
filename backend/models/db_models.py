from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
    JSON,
    Index
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Role(Base):
    __tablename__ = "roles"
    id = Column(String(50), primary_key=True) # e.g. "admin", "lead_engineer"
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    permissions = Column(JSON, default=list) # ["upload", "query_rag", "run_agents", "approve_hitl"]
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="role_rel")

class User(Base):
    __tablename__ = "users"
    id = Column(String(100), primary_key=True)
    username = Column(String(100), nullable=False, unique=True, index=True)
    email = Column(String(255), nullable=True, unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), ForeignKey("roles.id"), nullable=False, default="lead_engineer")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    role_rel = relationship("Role", back_populates="users")
    conversations = relationship("Conversation", back_populates="user")

class Document(Base):
    __tablename__ = "documents"
    id = Column(String(100), primary_key=True, index=True)
    filename = Column(String(255), nullable=False, index=True)
    file_type = Column(String(50), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    page_count = Column(Integer, default=1)
    upload_time = Column(String(100), nullable=False)
    classification = Column(String(100), default="CONFIDENTIAL INDUSTRIAL")
    sha256_hash = Column(String(64), nullable=False, index=True)
    status = Column(String(50), default="INDEXED")
    tags = Column(JSON, default=list)
    summary = Column(Text, nullable=True)
    chunks_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    id = Column(String(100), primary_key=True, index=True)
    document_id = Column(String(100), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    page = Column(Integer, default=1)
    section = Column(String(255), nullable=True)
    text = Column(Text, nullable=False)
    embedding_json = Column(JSON, nullable=True) # Serialized vector if stored in PG
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="chunks")

    __table_args__ = (
        Index("ix_doc_chunk_lookup", "document_id", "chunk_index"),
    )

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(String(100), ForeignKey("users.id"), nullable=True)
    title = Column(String(255), default="Industrial Analysis Session")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    id = Column(String(100), primary_key=True, index=True)
    conversation_id = Column(String(100), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=True, index=True)
    role = Column(String(20), nullable=False) # 'user' | 'assistant' | 'system'
    content = Column(Text, nullable=False)
    timestamp = Column(String(50), nullable=False)
    citations = Column(JSON, default=list)
    confidence = Column(Float, default=0.95)
    model_used = Column(String(150), default="DeepSeek-R1-Distill-Qwen")
    inference_time_ms = Column(Integer, default=320)
    is_air_gapped = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")

class Agent(Base):
    __tablename__ = "agents"
    id = Column(String(100), primary_key=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    icon = Column(String(50), default="Workflow")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    runs = relationship("AgentRun", back_populates="agent")

class AgentRun(Base):
    __tablename__ = "agent_runs"
    id = Column(String(100), primary_key=True, index=True)
    agent_id = Column(String(100), ForeignKey("agents.id"), nullable=False, index=True)
    agent_name = Column(String(150), nullable=False)
    document_id = Column(String(100), nullable=True)
    document_name = Column(String(255), nullable=True)
    status = Column(String(50), default="AWAITING_HUMAN_APPROVAL")
    current_step = Column(Integer, default=7)
    total_steps = Column(Integer, default=7)
    steps_json = Column(JSON, default=list)
    final_output = Column(Text, nullable=True)
    hitl_required = Column(Boolean, default=True)
    hitl_status = Column(String(50), default="PENDING")
    hitl_signed_by = Column(String(150), nullable=True)
    hitl_signature_hash = Column(String(255), nullable=True)
    hitl_comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    agent = relationship("Agent", back_populates="runs")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String(100), primary_key=True, index=True)
    timestamp = Column(String(100), nullable=False, index=True)
    user_role = Column(String(100), nullable=False)
    action = Column(String(100), nullable=False, index=True)
    resource = Column(String(255), nullable=False)
    ip_address = Column(String(100), default="127.0.0.1 (Local Sovereign Enclave)")
    status = Column(String(50), default="SUCCESS")
    external_egress_bytes = Column(Integer, default=0)
    latency_ms = Column(Integer, default=15)
    data_hash = Column(String(100), nullable=False)
    details_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

class ModelRegistry(Base):
    __tablename__ = "models"
    id = Column(String(100), primary_key=True)
    name = Column(String(150), nullable=False)
    type = Column(String(50), nullable=False) # 'LLM', 'VLM', 'Embeddings'
    precision = Column(String(50), default="Q4_K_M")
    vram_alloc_gb = Column(Float, default=6.4)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SystemMetric(Base):
    __tablename__ = "system_metrics"
    id = Column(String(100), primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    cpu_pct = Column(Float, default=18.5)
    memory_gb = Column(Float, default=12.2)
    vram_gb = Column(Float, default=6.4)
    vectors_count = Column(Integer, default=1420)
    external_api_calls = Column(Integer, default=0)
