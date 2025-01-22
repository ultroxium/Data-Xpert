from fastapi import HTTPException,status
from sqlalchemy.orm import Session

from app.Helper.websocket import manager
from app.api.auth.model import UserModel
from app.api.notifications.model import NotificationModel
from app.api.workspaces.teams.members_model import TeamMemberModel
from app.Helper.email import EmailService
from app.api.workspaces.teams.model import TeamModel
from app.core.config import settings


email_service = EmailService()

class Services:
    def __init__(self, db: Session, current_user: dict):
        self.db = db
        self.current_user = current_user
        
    async def create_team_member(self, data):
        user = self.db.query(UserModel).filter(UserModel.email == data.email).first()
        
        existing_team_member = self.db.query(TeamMemberModel).filter(TeamMemberModel.email == data.email,TeamMemberModel.team_id==data.team_id).first()
        if existing_team_member:
            raise HTTPException(
                status_code=400,
                detail="User already added to the team",
            )
            
        status = "active" if user else "pending"
        user_id = user.id if user else None
         
        team = TeamMemberModel(
            team_id=data.team_id,
            workspace_id=data.workspace_id,
            user_id=user_id,
            role_id=data.role_id,
            email=data.email,
            status=status,
            )
        
        team_detail=self.db.query(TeamModel).filter(TeamModel.id==data.team_id).first()
        inviter = self.db.query(UserModel).filter(UserModel.id == self.current_user.id).first()
        
        notification_message = (
        f"You have been added to the {team_detail.name}, by {inviter.name}." if status == "active"
        else f"You have been invited by {inviter.name} to join {team_detail.name}."
        )
        notification = NotificationModel(
            user_id=user_id,
            message=notification_message,
            title="Team Invitation",
            tag="invitation",
        )
    
        self.db.add(team)
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(team)
        if user_id:
            await manager.send_personal_message({
                "title": "Team Invitation",
                "message": notification_message,
                "tag": "invitation",
                "created_at": f"{notification.created_at}",
                }, user_id,'notification')
            
        # email_service.send_invitation_email(data.email, f"{settings.FRONTEND_URL}/workspace?wid={data.workspace_id}")
        return team
    
    
    def update_team_member(self, data, member_id):
        team = self.db.query(TeamMemberModel).filter(TeamMemberModel.id == member_id).first()
        if team:
            team.role_id = data.role_id
            self.db.commit()
            self.db.refresh(team)
            return team
        return None
    
    async def delete_team_member(self, member_id):
        team = self.db.query(TeamMemberModel).filter(TeamMemberModel.id == member_id).first()
        if team:
            self.db.delete(team)
            self.db.commit()
            notification_message=f"You have been removed from the team."
            notification = NotificationModel(
                user_id=team.user_id,
                message=notification_message,
                title="Team Invitation",
                tag="invitation",
            )
            self.db.add(notification)
            self.db.commit()
            self.db.refresh(notification)
            await manager.send_personal_message({
                "title": "Team Invitation",
                "message": notification_message,
                "tag": "invitation",
                "created_at": f"{notification.created_at}",
                }, team.user_id,'notification')
            return team
        return None
    
    def get_team_member(self, team_id):
        team = self.db.query(TeamMemberModel).filter(TeamMemberModel.team_id == team_id).all()
        if team:
            return team
        return []