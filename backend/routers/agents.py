from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any, Optional
from models.schemas import AgentExecution
from services.agent_runner import agent_runner

router = APIRouter(prefix="/api/agents", tags=["Agentic AI"])

@router.get("", response_model=List[Dict[str, Any]])
def list_available_agents():
    return agent_runner.list_agents()

@router.get("/executions", response_model=List[AgentExecution])
def list_agent_executions():
    return agent_runner.list_executions()

@router.post("/run", response_model=AgentExecution)
def trigger_agent(
    agent_id: str = Body(...),
    document_id: Optional[str] = Body(None),
    user_role: str = Body("Lead Plant Engineer")
):
    return agent_runner.run_agent(agent_id, document_id, user_role)

@router.get("/executions/{exec_id}", response_model=AgentExecution)
def get_agent_execution(exec_id: str):
    res = agent_runner.get_execution(exec_id)
    if not res:
        raise HTTPException(status_code=404, detail="Execution not found")
    return res
