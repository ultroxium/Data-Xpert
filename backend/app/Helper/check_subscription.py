from sqlalchemy.orm import Session

from app.api.plans.model import SubscriptionModel

class PlanType:
    BASIC = 1
    PRO = 2

class SubscriptionCheck:
    def __init__(self, db: Session, current_user: dict):
        self.db = db
        self.current_user = current_user

    def get_subscription_type(self):
        sub= self.db.query(SubscriptionModel).filter(
            SubscriptionModel.user_id == self.current_user.id
        ).first()
        if not sub:
            return PlanType.BASIC
        return sub.plan_id
        