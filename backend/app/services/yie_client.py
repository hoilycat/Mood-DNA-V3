import httpx


async def query_yie(domain: str, task: str, question: str) -> dict | None:
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "http://localhost:8000/rag/query",
                json={
                    "domain": domain,
                    "task": task,
                    "question": question,
                    "context": {},
                },
            )
            response.raise_for_status()
            return response.json()
    except Exception:
        return None
