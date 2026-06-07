from typing import Optional, TypeVar, Generic, List
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    status: bool
    messages: List[str]
    data: Optional[T] = None


def create_response(
    status: bool,
    messages: List[str],
    data: Optional[T] = None
) -> APIResponse[T]:
    return APIResponse(
        status=status,
        messages=messages,
        data=data
    )


async def bad_request_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=400,
        content=create_response(
            status=False,
            messages=[exc.detail or "Yêu cầu không hợp lệ"]
        ).model_dump()
    )


async def unauthorized_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=401,
        content=create_response(
            status=False,
            messages=[exc.detail or "Không có quyền truy cập"]
        ).model_dump()
    )


async def forbidden_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=403,
        content=create_response(
            status=False,
            messages=[exc.detail or "API không hợp lệ"]
        ).model_dump()
    )


async def not_found_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=404,
        content=create_response(
            status=False,
            messages=[exc.detail or "Không tìm thấy tài nguyên"]
        ).model_dump()
    )


async def internal_server_error_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=create_response(
            status=False,
            messages=["Lỗi máy chủ ", str(exc)]
        ).model_dump()
    )


exception_handlers = {
    400: bad_request_handler,
    401: unauthorized_handler,
    403: forbidden_handler,
    404: not_found_handler,
    500: internal_server_error_handler,
}