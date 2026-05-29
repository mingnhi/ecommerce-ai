from typing import Generic, Optional, TypeVar, List

from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    status: bool
    messages: List[str]
    data: Optional[T] = None