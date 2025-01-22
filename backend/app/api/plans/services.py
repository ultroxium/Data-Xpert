from sqlalchemy.orm import Session
from app.api.plans.model import PlanModel, SubscriptionModel

class Services:
    def __init__(self, db: Session, current_user: dict):
        self.db = db
        self.current_user = current_user

    def get_plan(self):
        subscription = self.db.query(SubscriptionModel).filter(SubscriptionModel.user_id == self.current_user.id).first()
        plan = self.db.query(PlanModel).filter(PlanModel.id == subscription.plan_id).first()

        result = {
            'id': plan.id,
            'name': plan.name,
            'price': plan.price,
            'max_workspaces': plan.max_workspaces,
            'max_datasets_per_workspace': plan.max_datasets_per_workspace,
            'plan_id': subscription.plan_id,
            'start_date': subscription.start_date,
            'next_payment_date': subscription.next_payment_date,
            'status': subscription.status,
            'created_at': subscription.created_at,
            'updated_at': subscription.updated_at
        }

        return result