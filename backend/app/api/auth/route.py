from fastapi import APIRouter, BackgroundTasks, status, Depends, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.Helper.websocket import manager
from app.api.plans.model import SubscriptionModel
from app.api.workspaces.teams.members_model import TeamMemberModel
from app.database.database import get_db
from app.api.auth.response import (
    GetUser,
    UserSignUp,
    OTPVerification,
    SetPassword,
    LoginRequest,
    TokenResponse,
    RefreshRequest,
)
from app.api.auth.model import UserModel
from datetime import datetime, timedelta
import random
import string
from app.Helper.email import EmailService
from app.api.auth.services import (
    get_current_active_user,
    get_current_user,
    hash_password,
    create_access_token,
    verify_password,
    verify_token,
    create_refresh_token,
    create_reset_token,
)
from jose import jwt, JWTError
from app.api.workspaces.model import WorkspaceModel


from app.core.config import settings

email_service = EmailService()


router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
    responses={404: {"description": "Not found"}},
)


def generate_otp():
    return "".join(random.choices(string.digits, k=6))


@router.post("/signup/")
def signup(user: UserSignUp, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter(UserModel.email == user.email, UserModel.is_deleted==False).first()
    if db_user and db_user.is_verified:
        raise HTTPException(status_code=400, detail="Email already registered")

    otp = generate_otp()
    otp_expiry = datetime.utcnow() + timedelta(minutes=10)

    if db_user and not db_user.is_verified:
        db_user.otp = otp
        db_user.otp_expiry = otp_expiry
        db.commit()
        db.refresh(db_user)
        email_service.send_otp_email(user.email, otp)
        return {
            "message": "Your email is already registered. Otp has be sent to your email. Please verify."
        }

    new_user = UserModel(
        name=user.name,
        email=user.email,
        is_verified=False,
        otp=otp,
        otp_expiry=otp_expiry,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    email_service.send_otp_email(user.email, otp)
    return {"message": "OTP sent to your email"}


@router.post("/verify-otp/")
def verify_otp(otp_data: OTPVerification, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter(UserModel.email == otp_data.email,UserModel.is_deleted==False).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email")
    if db_user.otp != otp_data.otp or db_user.otp_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    team = db.query(TeamMemberModel).filter(TeamMemberModel.email == db_user.email).all()
    if team:
        for member in team:
            member.user_id = db_user.id
            member.status = "active"
        db.commit()
        for member in team:
            db.refresh(member)

    db_user.is_verified = True
    
    db_user.verified_at = datetime.utcnow()
    db_user.otp = None
    db_user.otp_expiry = None
    db.commit()
    db.refresh(db_user)
    return {"message": "Email verified"}


@router.post("/set-password/")
def set_password(password_data: SetPassword, db: Session = Depends(get_db)):
    db_user = (
        db.query(UserModel)
        .filter(UserModel.email == password_data.email, UserModel.is_verified == True,UserModel.is_deleted==False)
        .first()
    )
    if not db_user:
        raise HTTPException(
            status_code=400, detail="Invalid email or email not verified"
        )

    db_user.password = hash_password(password_data.password)
    db_user.registered_at = datetime.utcnow()

    subscription_obj = SubscriptionModel(
        user_id = db_user.id,
        plan_id =1,
    )

    new_workspace = WorkspaceModel(
        name="Default Workspace",
        created_by=db_user.id,
    )

    db.add(subscription_obj)
    db.add(new_workspace)

    db.commit()
    db.refresh(db_user)
    
    return {"message": "Password set and registration completed"}


@router.post("/resend-otp/")
def resend_otp(email: str, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter(UserModel.email == email,UserModel.is_deleted==False).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email")

    if db_user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")

    # Generate a new OTP
    otp = generate_otp()
    otp_expiry = datetime.utcnow() + timedelta(minutes=10)

    db_user.otp = otp
    db_user.otp_expiry = otp_expiry
    db.commit()
    db.refresh(db_user)

    # Send the new OTP
    email_service.send_otp_email(email, otp)
    return {"message": "New OTP sent to your email"}


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = db.query(UserModel).filter(UserModel.email == form_data.username,UserModel.is_deleted==False).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"id":user.id,"sub": user.email}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"id":user.id,"sub": user.email})

    return {
        "message": "You have been logged in successfully.",
        "access_token": access_token,
        "refresh_token": refresh_token,
    }


@router.post("/refresh-token", response_model=TokenResponse)
async def refresh_token(request: RefreshRequest):
    payload = verify_token(request.refresh_token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )

    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(data={"id":payload['id'],"sub": payload["sub"]})
    refresh_token = create_refresh_token(data={"id":payload['id'],"sub": payload["sub"]})

    return {"access_token": access_token, "refresh_token": refresh_token,"message":"Token refreshed successfully."}


@router.post("/logout")
async def logout():
    return {"message": "Logout successful"}


@router.post("/reset-password-request/")
async def reset_password_request(
    email: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)
):
    db_user = db.query(UserModel).filter(UserModel.email == email,UserModel.is_deleted==False).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email")

    reset_token = create_reset_token(
        data={"sub": db_user.email}, expires_delta=timedelta(minutes=10)
    )

    # Send the reset link via email
    reset_link = f"{settings.FRONTEND_URL}/auth/reset-password?key={reset_token}"
    background_tasks.add_task(email_service.send_reset_password_email, email, reset_link)

    return {"message": "Password reset link sent to your email"}


@router.post("/reset-password/")
async def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=400, detail="Invalid token")
    except jwt.JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")

    db_user = db.query(UserModel).filter(UserModel.email == email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email")

    db_user.password = hash_password(new_password)
    db_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_user)

    return {"message": "Password reset successful"}


@router.get("/me", response_model=GetUser)
def read_users_me(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    user = db.query(UserModel).filter(UserModel.id == current_user.id,UserModel.is_deleted==False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # if user:
    #     await manager.send_personal_message(
    #         {
    #             "title": f"Test {datetime.utcnow()}",
    #             "message": "Test message",
    #             "tag": "test",
    #             "created_at": "2024-08-26T06:22:47.091917"
    #         }, user.id
    #     )
    return user

@router.delete("/account")
async def delete_account(
    password: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    user = db.query(UserModel).filter(UserModel.id == current_user.id,UserModel.is_deleted==False).first()
    if not user or password != 'DELETE/ACCOUNT':
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )
    user.email= f"{user.email}_deleted_{int(datetime.now().timestamp())}"
    user.google_id = None
    user.is_deleted = True
    db.commit()
    return {"message": "Account deleted successfully."}