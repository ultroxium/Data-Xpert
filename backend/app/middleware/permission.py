from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session
from app.api.workspaces.model import WorkspaceModel
from app.api.workspaces.teams.members_model import TeamMemberModel
from typing import Callable

class PermissionMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, db: Session):
        super().__init__(app)
        self.db = db

    async def dispatch(self, request: Request, call_next: Callable):
        # Extract workspace_id from query parameters (or from the request body for POST requests)
        workspace_id = request.query_params.get('workspace_id')
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            # Check if the user has edit access
            if workspace_id:
                self.check_edit_access(workspace_id, request)
        elif request.method == 'GET':
            # Check if the user has view access
            if workspace_id:
                self.check_view_access(workspace_id, request)

        response = await call_next(request)
        return response

    def check_edit_access(self, workspace_id: int, request: Request):
        # Get current user from request state (you'll need to ensure current_user is set beforehand)
        current_user = request.state.current_user
        default_workspace = self.db.query(WorkspaceModel).filter(
            WorkspaceModel.id == workspace_id,
            WorkspaceModel.created_by == current_user.id,
            WorkspaceModel.name == "Default Workspace"
        ).first()

        if default_workspace:
            return

        accessable_workspace = self.db.query(TeamMemberModel).filter(
            TeamMemberModel.workspace_id == workspace_id,
            TeamMemberModel.user_id == current_user.id,
            TeamMemberModel.role_id.in_([1, 2])  # 1 = Admin, 2 = Editor (edit access)
        ).first()

        if not accessable_workspace:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to edit this workspace."
            )

    def check_view_access(self, workspace_id: int, request: Request):
        # Get current user from request state (you'll need to ensure current_user is set beforehand)
        current_user = request.state.current_user
        default_workspace = self.db.query(WorkspaceModel).filter(
            WorkspaceModel.created_by == current_user.id,
            WorkspaceModel.name == "Default Workspace"
        ).first()

        if default_workspace:
            return

        accessable_workspace = self.db.query(TeamMemberModel).filter(
            TeamMemberModel.user_id == current_user.id,
            TeamMemberModel.workspace_id == workspace_id
        ).first()

        if not accessable_workspace:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this workspace."
            )
