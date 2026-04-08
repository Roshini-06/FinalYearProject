from typing import Generic, TypeVar, Optional, List, Any
from pydantic import BaseModel

DataType = TypeVar("DataType")

class BaseResponse(BaseModel, Generic[DataType]):
    status: str = "success"
    message: Optional[str] = None
    data: Optional[DataType] = None
    error: Optional[Any] = None

class ErrorResponse(BaseResponse):
    status: str = "error"
    error: Any
