from pydantic import BaseModel


class HealthData(BaseModel):
    service: str
    model: str
    device: str


class HealthResponse(BaseModel):
    status: bool
    message: str
    data: HealthData