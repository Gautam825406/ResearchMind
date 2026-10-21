from langchain.agents import create_agent
import os
from pathlib import Path
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda
from tools import web_search , scrape_url 
from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))

#model setup 
model_name = os.getenv("GROQ_MODEL") or "openai/gpt-oss-20b"
llm = ChatGroq(
    model=model_name, temperature=0, max_tokens=2048,
    reasoning_effort="low" if "gpt-oss" in model_name else None,
)


def require_text(text: str) -> str:
    if not text.strip():
        raise ValueError("Groq returned an empty text response. Please retry the research.")
    return text


def build_text_chain(prompt):
    return (prompt | llm | StrOutputParser() | RunnableLambda(require_text)).with_retry(
        retry_if_exception_type=(ValueError,), stop_after_attempt=2, wait_exponential_jitter=False,
    )


#1st agent 
def build_search_agent():
    return create_agent(
        model = llm,
        tools= [web_search],
        system_prompt="Search once, then summarize the findings in at most 400 words. Include source URLs.",
    )

#2nd agent 

def build_reader_agent():
    return create_agent(
        model = llm,
        tools = [scrape_url],
        system_prompt="Read one relevant source, then summarize it in at most 400 words. Include the source URL.",
    )


#writer chain 

writer_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an expert research writer. Write clear, structured and insightful reports."),
    ("human", """Write a detailed research report on the topic below.

Topic: {topic}

Research Gathered:
{research}

Structure the report as:
- Introduction
- Key Findings (minimum 3 well-explained points)
- Conclusion
- Sources (list all URLs found in the research)

Be factual and professional. Keep the complete report under 700 words."""),
])

writer_chain = build_text_chain(writer_prompt)

#critic_chain 

critic_prompt = ChatPromptTemplate.from_messages([
     ("system", "You are a sharp and constructive research critic. Be honest and specific."),
    ("human", """Review the research report below and evaluate it strictly.

Report:
{report}

Respond in this exact format:

Score: X/10

Strengths:
- ...
- ...

Areas to Improve:
- ...
- ...

One line verdict:
...

Keep the complete review under 300 words."""),
])

critic_chain = build_text_chain(critic_prompt)

