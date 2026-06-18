from fastapi import APIRouter, Depends, HTTPException, Request, Response
import httpx
from typing import Dict, Any

from app.core.config import settings
from app.api.deps import get_current_user

router = APIRouter(tags=["auth"])


async def proxy_request(method: str, path: str, json_data: dict = None):
    url = f"{settings.AUTH_SERVICE_URL}{path}"
    async with httpx.AsyncClient() as client:
        try:
            req = client.build_request(method, url, json=json_data)
            resp = await client.send(req)
            return Response(
                content=resp.content,
                status_code=resp.status_code,
                media_type=resp.headers.get("content-type"),
            )
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=503, detail=f"Auth service unavailable: {exc}"
            )


@router.post("/register")
async def proxy_register(request: Request):
    data = await request.json()
    return await proxy_request("POST", "/register", data)


@router.post("/login")
async def proxy_login(request: Request):
    data = await request.json()
    return await proxy_request("POST", "/login", data)


@router.post("/refresh")
async def proxy_refresh(request: Request):
    data = await request.json()
    return await proxy_request("POST", "/refresh", data)


@router.post("/logout")
async def proxy_logout(request: Request):
    data = await request.json()
    return await proxy_request("POST", "/logout", data)


@router.get("/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    # Simply return the JWT decoded payload
    return {"user": current_user}
