import httpx

YIE_URL = "http://localhost:8001/rag/query"


def query_yie_sync(
    question: str,
    task: str = "디자인 비평",
    context: dict = None,
) -> dict | None:
    """동기 YIE 호출 — ai_consultant.py(sync 함수)에서 직접 사용"""
    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.post(
                YIE_URL,
                json={
                    "domain": "design",
                    "task": task,
                    "question": question,
                    "context": context or {},
                },
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"[YIE] 호출 실패: {e}")
        return None


async def query_yie(domain: str, task: str, question: str, context: dict = None) -> dict | None:
    """비동기 YIE 호출 — FastAPI 라우터(async)에서 사용"""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                YIE_URL,
                json={
                    "domain": domain,
                    "task": task,
                    "question": question,
                    "context": context or {},
                },
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"[YIE] 비동기 호출 실패: {e}")
        return None
