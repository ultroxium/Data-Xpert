from fastapi import APIRouter, status, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.api.feedback.services import PublicServices
from app.api.feedback.response import FeedbackCreate

router = APIRouter(
    prefix="/feedback",
    tags=["FeedBack"],
    responses={404: {"description": "Not found"}},
)

def get_public_services(db: Session = Depends(get_db)) -> PublicServices:
    return PublicServices(db=db)

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_feedback(
    feedback: FeedbackCreate,
    public_services: PublicServices = Depends(get_public_services),
):
    new_feedback =  public_services.create_feedback(feedback)
    return new_feedback
