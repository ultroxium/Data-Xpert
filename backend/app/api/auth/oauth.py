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
    tags=["Google Auth"],
    responses={404: {"description": "Not found"}},
)

# Configure OAuth
config = Config(".env")
oauth = OAuth(config)

oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    access_token_url='https://accounts.google.com/o/oauth2/token',
    access_token_params=None,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    userinfo_endpoint='https://openidconnect.googleapis.com/v1/userinfo',
    redirect_uri=settings.GOOGLE_REDIRECT_URI,
    # This is only needed if using openId to fetch user info
    # client_kwargs={'scope': 'openid email profile'},
    client_kwargs={'scope': 'openid email profile https://www.googleapis.com/auth/userinfo.profile'},
    jwks_uri = "https://www.googleapis.com/oauth2/v3/certs"
)

@router.get("/google")
async def login_via_google(request: Request):
    redirect_uri = request.url_for('auth_callback')  
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/callback")
async def auth_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
        # id_token = token.get('id_token')
        # if not id_token:
        #     raise HTTPException(status_code=400, detail="Missing id_token")
        # # Parse id_token
        # user_info = token.get('userinfo')
        user_info_response = await oauth.google.get('userinfo', token=token)
        user_info = user_info_response.json()
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to retrieve user information")
    except Exception as e:
        print(f"OAuth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

    # Your existing user handling code
    user = db.query(UserModel).filter(UserModel.email == user_info['email'],UserModel.is_deleted==False).first()
    if not user:
        user = UserModel(
            email=user_info['email'],
            google_id=user_info['id'],
            name=user_info['name'],
            picture=user_info['picture'],
            is_verified=True,
            verified_at=datetime.utcnow(),
            registered_at=datetime.utcnow(),
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
    
    subscription = db.query(SubscriptionModel).filter(SubscriptionModel.user_id==user.id).first()
    if not subscription:
        subscription_obj = SubscriptionModel(
        user_id = user.id,
        plan_id =2,
        )
        db.add(subscription_obj)
        db.commit()
        
    default_workspace = db.query(WorkspaceModel).filter(WorkspaceModel.created_by==user.id,WorkspaceModel.name=="Default Workspace").first()
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
        data={"id":user.id,"sub": user.email}, expires_delta=access_token_expires
    )

    redirect_url = f"{settings.FRONTEND_URL}/dashboard?token={access_token}"
    return RedirectResponse(url=redirect_url)

@router.get('/logout')
async def logout(request: Request):
    user = request.session.get('user')
    
    if user:
        access_token = user.get('access_token')
        
        # Optional: Revoke the token on the provider's side
        if access_token:
            revoke_url = f"https://accounts.google.com/o/oauth2/revoke?token={access_token}"
            async with httpx.AsyncClient() as client:
                await client.post(revoke_url)
        
        # Clear session data
        request.session.clear()  # This clears all session data
    
    return RedirectResponse(url='https://www.dataxpert.vercel.app')

