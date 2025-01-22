from fastapi import status, HTTPException
from sqlalchemy.orm import Session
from app.api.workspaces.model import WorkspaceModel
from app.api.workspaces.teams.members_model import TeamMemberModel

class Role:
    OWNER = 1
    EDITOR = 2
    VIEWER = 3

class PermissionCheck:
    def __init__(self, db: Session, current_user: dict):
        self.db = db
        self.current_user = current_user
        
    def get_default_workspace(self):
        # Helper to retrieve the default workspace
        return self.db.query(WorkspaceModel).filter(
            WorkspaceModel.created_by == self.current_user.id,
            WorkspaceModel.name == "Default Workspace"
        ).first()
        
    def check_edit_access(self, workspace_id: int):
        if not workspace_id:
            return True
        
        # Check if the workspace is the default workspace
        default_workspace = self.get_default_workspace()
        if default_workspace and default_workspace.id == workspace_id:
            return True  

        if not workspace_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Workspace ID is required."
            )

        
        # Check if the user has roles 1 or 2 (e.g., Admin, Editor)
        accessible_workspace = self.db.query(TeamMemberModel).filter(
            TeamMemberModel.workspace_id == workspace_id,
            TeamMemberModel.user_id == self.current_user.id,
            TeamMemberModel.role_id.in_([Role.OWNER, Role.EDITOR])
        ).first()

        if not accessible_workspace:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to edit this workspace."
            )
        return True  
    
    def check_view_access(self, workspace_id: int):
        if not workspace_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Workspace ID is required."
            )
        
        # Check if the workspace is the default workspace
        default_workspace = self.get_default_workspace()
        if default_workspace and default_workspace.id == workspace_id:
            return True 

        # Check if the user has access to the workspace as a member
        accessible_workspace = self.db.query(TeamMemberModel).filter(
            TeamMemberModel.user_id == self.current_user.id,
            TeamMemberModel.workspace_id == workspace_id
        ).first()

        if not accessible_workspace:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this workspace."
            )
        return True
