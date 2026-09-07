import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "demo") # "production" | "development" | "demo"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Server & CORS
    CORS_ORIGINS: List[str] = [
        origin.strip() 
        for origin in os.getenv("CORS_ORIGINS", "*").split(",") 
        if origin.strip()
    ]
    
    # Database (PostgreSQL / SQLite fallback)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./indra_sovereign.db")
    
    # Vector Database (Qdrant / Chroma / In-memory fallback)
    QDRANT_URL: str = os.getenv("QDRANT_URL", "")
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")
    
    # AI Provider: "mock" | "local" | "ollama" | "openai" | "deepseek"
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "auto")
    LOCAL_LLM_MODEL: str = os.getenv("LOCAL_LLM_MODEL", "deepseek-r1:14b")
    LOCAL_VLM_MODEL: str = os.getenv("LOCAL_VLM_MODEL", "llama3.2-vision:11b")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
    REMOTE_AI_API_KEY: str = os.getenv("REMOTE_AI_API_KEY", "")
    REMOTE_AI_BASE_URL: str = os.getenv("REMOTE_AI_BASE_URL", "https://api.deepseek.com/v1")
    
    # Storage Provider: "local" | "production"
    STORAGE_PROVIDER: str = os.getenv("STORAGE_PROVIDER", "local")
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "50"))
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "sovereign-indra-secret-key-change-in-prod-2026")

settings = Settings()
