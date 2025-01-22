from fastapi import status, HTTPException
from app.Helper.check_subscription import PlanType, SubscriptionCheck
from app.api.workspaces.teams.members_model import TeamMemberModel
from app.database.database import get_db
from app.api.auth.services import get_current_active_user
from app.api.workspaces.model import WorkspaceModel
from app.api.workspaces.response import WorkspaceCreate
from sqlalchemy.orm import Session
from app.api.datasets.model import DatasetModel
from app.api.workspaces.teams.model import TeamModel
from sqlalchemy.orm import aliased



class Services:
    def __init__(self, db: Session, current_user: dict):
        self.db = db
        self.current_user = current_user
        self.subscription = SubscriptionCheck(db, current_user)

    def _query_non_deleted_workspace(self, **filters):
        return (
            self.db.query(WorkspaceModel)
            .filter_by(**filters, is_deleted=False)
            .first()
        )

    def create_workspace(self, data: WorkspaceCreate):
        SubscriptionType = self.subscription.get_subscription_type()
        if SubscriptionType == PlanType.BASIC:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You need to upgrade to a Pro plan to create more workspaces",
            )

        existing_workspace = self._query_non_deleted_workspace(name=data.name)
        if existing_workspace:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Workspace with this name already exists",
            )

        workspace_count = (
            self.db.query(WorkspaceModel)
            .filter(WorkspaceModel.created_by == self.current_user.id, WorkspaceModel.is_deleted == False)
            .count()
        )

        if workspace_count >= 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have exceeded the maximum limit of workspaces. If you need more, please contact support.",
            )

        new_workspace = WorkspaceModel(
            name=data.name,
            created_by=self.current_user.id,
        )

        self.db.add(new_workspace)
        self.db.flush()
        workspace_id = new_workspace.id
        team_name = f"{new_workspace.name} Team"
        
        team = TeamModel(
            name=team_name,
            workspace_id=workspace_id,
            created_by=self.current_user.id,
        )
        
        self.db.add(team)
        self.db.flush()
        
        member= TeamMemberModel(
            team_id=team.id,
            user_id=self.current_user.id,
            role_id=1,
            workspace_id=workspace_id,
            email=self.current_user.email,
            status="active",
        )
        self.db.add(member)
        self.db.commit()
        self.db.refresh(team)
        
        return new_workspace


    def update_workspace(self, data: WorkspaceCreate, workspace_id: int):
        workspace = self._query_non_deleted_workspace(id=workspace_id)
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found",
            )

        if workspace.name == data.name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Workspace with this name already exists",
            )

        if not data.name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Workspace name cannot be empty",
            )

        workspace.name = data.name
        workspace.updated_by = self.current_user.id
        self.db.commit()
        self.db.refresh(workspace)
        return workspace

    def delete_workspace(self, workspace_id: int):
        workspace = self.db.query(WorkspaceModel).filter_by(id=workspace_id).first()
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found",
            )

        related_database = (
            self.db.query(DatasetModel)
            .filter(DatasetModel.workspace_id == workspace_id)
            .first()
        )

        if related_database:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Workspace has related datasets. Delete them first",
            )

        workspace.is_deleted = True
        self.db.commit()
        self.db.refresh(workspace)
        return {"message": "Workspace deleted successfully"}

    def get_workspace(self, workspace_id: int):
        if workspace_id != 0:
            workspace = self._query_non_deleted_workspace(id=workspace_id)
        else:
            workspace = (
                self.db.query(WorkspaceModel)
                .filter(
                    WorkspaceModel.created_by == self.current_user.id,
                    WorkspaceModel.name == "Default Workspace",
                )
                .first()
            )
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found",
            )
        return workspace
    
    def get_all_workspaces(self):
        # Alias for the teams
        team_member_alias = aliased(TeamMemberModel)

        # Query to fetch workspaces
        workspaces = (
            self.db.query(WorkspaceModel)
            .outerjoin(TeamModel, TeamModel.workspace_id == WorkspaceModel.id)
            .outerjoin(team_member_alias, team_member_alias.team_id == TeamModel.id)
            .filter(
                (WorkspaceModel.created_by == self.current_user.id) |  # Workspaces created by the current user
                (team_member_alias.user_id == self.current_user.id)    # Workspaces associated with the user's teams
            )
            .filter(WorkspaceModel.is_deleted == False)  # Filter out deleted workspaces
            .distinct()  # Ensure no duplicates in the result
            .all()
        )
        return workspaces
