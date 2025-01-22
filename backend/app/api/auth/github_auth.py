from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
import httpx
from starlette.config import Config
from app.api.auth.services import create_access_token
from app.api.plans.model import SubscriptionModel
from app.api.workspaces.model import WorkspaceModel
from app.core.config import settings
from app.database.database import get_db
from sqlalchemy.orm import Session
from app.api.auth.model import UserModel
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/auth",
    tags=["GitHub Auth"],
    responses={404: {"description": "Not found"}},
)

# Configure OAuth
config = Config(".env")
oauth = OAuth(config)

oauth.register(
    name='github',
    client_id=settings.GITHUB_CLIENT_ID,
    client_secret=settings.GITHUB_CLIENT_SECRET,
    access_token_url='https://github.com/login/oauth/access_token',
    authorize_url='https://github.com/login/oauth/authorize',
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'user:email read:user'},
    redirect_uri=settings.GITHUB_REDIRECT_URI,
)

@router.get("/github")
async def login_via_github(request: Request):
    redirect_uri = request.url_for('github_callback')
    return await oauth.github.authorize_redirect(request, redirect_uri)

@router.get("/github/callback")
async def github_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.github.authorize_access_token(request)
        
        # Get user information from GitHub API
        headers = {'Authorization': f'Bearer {token["access_token"]}'}
        async with httpx.AsyncClient() as client:
            user_response = await client.get('https://api.github.com/user', headers=headers)
            user_info = user_response.json()
            
            # GitHub doesn't always return email in user profile, so we need to fetch it separately
            emails_response = await client.get('https://api.github.com/user/emails', headers=headers)
            emails = emails_response.json()
            primary_email = next((email['email'] for email in emails if email['primary']), emails[0]['email'])
            
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to retrieve user information")
            
    except Exception as e:
        print(f"OAuth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

    # Handle user creation/update
    user = db.query(UserModel).filter(UserModel.email == primary_email, UserModel.is_deleted==False).first()
    if not user:
        user = UserModel(
            email=primary_email,
            github_id=str(user_info['id']),  # Add github_id field to UserModel if not exists
            name=user_info['name'] or user_info['login'],  # GitHub might return null for name
            picture=user_info['avatar_url'],
            is_verified=True,
            verified_at=datetime.utcnow(),
            registered_at=datetime.utcnow(),
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create subscription if not exists
    subscription = db.query(SubscriptionModel).filter(SubscriptionModel.user_id==user.id).first()
    if not subscription:
        subscription_obj = SubscriptionModel(
            user_id=user.id,
            plan_id=1,
        )
        db.add(subscription_obj)
        db.commit()
    
    # Create default workspace if not exists
    default_workspace = db.query(WorkspaceModel).filter(
        WorkspaceModel.created_by==user.id,
        WorkspaceModel.name=="Default Workspace"
    ).first()
    if not default_workspace:
        new_workspace = WorkspaceModel(
            name="Default Workspace",
            created_by=user.id,
        )
        db.add(new_workspace)
        db.commit()

    # Generate access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"id": user.id, "sub": user.email}, expires_delta=access_token_expires
    )

    redirect_url = f"{settings.FRONTEND_URL}/dashboard?token={access_token}"
    return RedirectResponse(url=redirect_url)

@router.get('/github/logout')
async def github_logout(request: Request):
    user = request.session.get('user')
    
    if user:
        # Clear session data
        request.session.clear()
    
    return RedirectResponse(url='https://www.dataxpert.vercel.app')