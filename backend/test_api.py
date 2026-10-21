import os
import sys
import unittest
from types import ModuleType
from unittest.mock import Mock, patch

from fastapi.testclient import TestClient
from groq import AuthenticationError, NotFoundError, RateLimitError
import httpx

from api import app, research_lock


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_without_keys(self):
        with patch.dict(os.environ, {}, clear=True):
            response = self.client.get("/api/health")
            self.assertFalse(response.json()["configured"])
            self.assertEqual(response.json()["missing_keys"], ["GROQ_API_KEY", "TAVILY_API_KEY"])
            self.assertEqual(self.client.post("/api/research", json={"topic": "Solar energy"}).status_code, 503)

    def test_groq_configuration_without_openai(self):
        with patch.dict(os.environ, {"GROQ_API_KEY": "test", "TAVILY_API_KEY": "test", "GROQ_MODEL": "custom-model"}, clear=True):
            response = self.client.get("/api/health")
            self.assertTrue(response.json()["configured"])
            self.assertEqual(response.json()["provider"], "Groq")
            self.assertEqual(response.json()["model"], "custom-model")

    def test_invalid_topic(self):
        for topic in ("  ", "ab", "x" * 501):
            self.assertEqual(self.client.post("/api/research", json={"topic": topic}).status_code, 422)

    def test_text_generation_retries_empty_responses(self):
        from langchain_core.messages import AIMessage
        from langchain_core.runnables import RunnableLambda

        with patch.dict(os.environ, {"GROQ_API_KEY": "test", "TAVILY_API_KEY": "test"}):
            import agents

        prompt = RunnableLambda(lambda value: value)
        responses = iter([AIMessage(content=""), AIMessage(content="A complete review")])
        with patch.object(agents, "llm", RunnableLambda(lambda value: next(responses))):
            self.assertEqual(agents.build_text_chain(prompt).invoke("Report"), "A complete review")
        empty_model = Mock(return_value=AIMessage(content=" "))
        with patch.object(agents, "llm", RunnableLambda(empty_model)):
            with self.assertRaisesRegex(ValueError, "empty text response"):
                agents.build_text_chain(prompt).invoke("Report")
            self.assertEqual(empty_model.call_count, 2)

    def test_provider_errors_are_actionable(self):
        pipeline = ModuleType("pipeline")
        request = httpx.Request("POST", "https://api.groq.com/openai/v1/chat/completions")
        cases = (
            (NotFoundError, 404, 502, "GROQ_MODEL"),
            (AuthenticationError, 401, 502, "GROQ_API_KEY"),
            (RateLimitError, 429, 429, "limit"),
        )
        with patch.dict(os.environ, {"GROQ_API_KEY": "test", "TAVILY_API_KEY": "test"}, clear=True), patch.dict(sys.modules, {"pipeline": pipeline}):
            self.assertEqual(self.client.get("/api/health").json()["model"], "openai/gpt-oss-20b")
            for error_type, provider_status, api_status, detail in cases:
                with self.subTest(error=error_type.__name__):
                    pipeline.run_research_pipeline = Mock(side_effect=error_type(
                        "Provider failure", response=httpx.Response(provider_status, request=request), body=None,
                    ))
                    with self.assertLogs("api", level="ERROR"):
                        response = self.client.post("/api/research", json={"topic": "Solar energy"})
                    self.assertEqual(response.status_code, api_status)
                    self.assertIn(detail, response.json()["detail"])
                    self.assertFalse(research_lock.locked())

    def test_research_and_failure_release_lock(self):
        pipeline = ModuleType("pipeline")
        pipeline.run_research_pipeline = Mock(return_value={"report": "Test report"})
        with patch.dict(os.environ, {"GROQ_API_KEY": "test", "TAVILY_API_KEY": "test"}, clear=True), patch.dict(sys.modules, {"pipeline": pipeline}):
            response = self.client.post("/api/research", json={"topic": "  Solar energy  "})
            self.assertEqual(response.json(), {"report": "Test report"})
            pipeline.run_research_pipeline.assert_called_once_with("Solar energy")
            pipeline.run_research_pipeline.side_effect = RuntimeError("provider failure")
            self.assertEqual(self.client.post("/api/research", json={"topic": "Solar energy"}).status_code, 502)
            self.assertFalse(research_lock.locked())

    def test_busy_pipeline(self):
        with patch.dict(os.environ, {"GROQ_API_KEY": "test", "TAVILY_API_KEY": "test"}, clear=True):
            research_lock.acquire()
            try:
                self.assertEqual(self.client.post("/api/research", json={"topic": "Solar energy"}).status_code, 409)
            finally:
                research_lock.release()


if __name__ == "__main__":
    unittest.main()