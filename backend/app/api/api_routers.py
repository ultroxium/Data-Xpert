from fastapi import APIRouter

from app.api.auth import route
from app.api.workspaces import route as workspace_route
from app.api.datasets import route as dataset_route
from app.api.charts import route as chart_route
from app.api.auth import oauth as oauth_route
from app.api.auth import github_auth as github_auth_route
from app.api.workspaces.teams import route as team_route
from app.api.notifications import router as notification_route
from app.api.chat import route as chat_route
from app.api.dashboard import route as dashboard_route
from app.api.plans import route as plan_route
from app.api.feature_engineering import router as feature_engineering_route
from app.api.models import router as model_route
from app.api.quick_notes import route as quick_notes_route

api_router = APIRouter()

api_router.include_router(route.router)
api_router.include_router(workspace_route.router)
api_router.include_router(dataset_route.router)
api_router.include_router(chart_route.router)
api_router.include_router(oauth_route.router)
api_router.include_router(github_auth_route.router)
api_router.include_router(team_route.router)
api_router.include_router(notification_route.router)
api_router.include_router(chat_route.router)
api_router.include_router(dashboard_route.router)
api_router.include_router(plan_route.router)
api_router.include_router(feature_engineering_route.router)
api_router.include_router(model_route.router)
api_router.include_router(quick_notes_route.router)