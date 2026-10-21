import logging
import os
from pathlib import Path
from threading import Lock

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from groq import AuthenticationError, NotFoundError, RateLimitError
from pydantic import BaseModel, Field, field_validator

load_dotenv(Path(__file__).with_name(".env"))

app = FastAPI(title="ResearchMind API")
research_lock = Lock()
logger = logging.getLogger(__name__)


class ResearchRequest(BaseModel):
    topic: str = Field(min_length=3, max_length=500)

    @field_validator("topic", mode="before")
    @classmethod
    def trim_topic(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value


def missing_keys() -> list[str]:
    return [name for name in ("GROQ_API_KEY", "TAVILY_API_KEY") if not os.getenv(name)]


@app.get("/api/health")
def health() -> dict:
    missing = missing_keys()
    return {
        "status": "ok", "configured": not missing, "missing_keys": missing,
        "provider": "Groq", "model": os.getenv("GROQ_MODEL") or "openai/gpt-oss-20b",
    }


@app.post("/api/research")
def research(request: ResearchRequest) -> dict:
    if missing_keys():
        raise HTTPException(503, "Add GROQ_API_KEY and TAVILY_API_KEY to .env, then restart the API.")
    if not research_lock.acquire(blocking=False):
        raise HTTPException(409, "A research run is already in progress. Try again when it finishes.")
    try:
        from pipeline import run_research_pipeline

        return run_research_pipeline(request.topic)
    except NotFoundError:
        logger.exception("Groq model unavailable")
        raise HTTPException(502, "Groq cannot access the configured model. Set GROQ_MODEL to an available tool-calling model in .env, then restart the API.") from None
    except AuthenticationError:
        logger.exception("Groq authentication failed")
        raise HTTPException(502, "Groq rejected the API key. Check GROQ_API_KEY in .env, then restart the API.") from None
    except RateLimitError:
        logger.exception("Groq rate limit reached")
        raise HTTPException(429, "Groq's rate or quota limit was reached. Wait before retrying or check your Groq account limits.") from None
    except Exception:
        logger.exception("Research pipeline failed")
        raise HTTPException(502, "Research failed. Check your API keys, provider limits, and the backend terminal.") from None
    finally:
        research_lock.release()