
from app.api.feedback.response import FeedbackCreate
from sqlalchemy.orm import Session
from app.api.feedback.model import FeedBackModel


class PublicServices:
    def __init__(self, db: Session):
        self.db = db

    def create_feedback(self, feedback: FeedbackCreate):
        feedback = FeedBackModel(
            name=feedback.name,
            email=feedback.email,
            message=feedback.message,
        )
        self.db.add(feedback)
        self.db.commit()
        self.db.refresh(feedback)
        return feedback