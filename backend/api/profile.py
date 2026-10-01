# profile api endpoints

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db, User, UserProfile
from schemas import UserProfileCreate, UserProfileUpdate, UserProfileResponse, UserResponse
from auth import get_current_email, require_owner

router = APIRouter(prefix="/profile", tags=["profile"])

def current_user(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/", response_model=UserProfileResponse)
def get_profile(db: Session = Depends(get_db), email: str = Depends(get_current_email)):
    """get user profile"""
    
    user_id = current_user(db, email).id
    
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="profile not found")
    
    return profile


@router.put("/", response_model=UserProfileResponse)
def update_profile(data: UserProfileUpdate, db: Session = Depends(get_db),
                   email: str = Depends(get_current_email)):
    """update user profile"""
    
    user_id = current_user(db, email).id
    
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="profile not found")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    
    return profile


@router.get("/user", response_model=UserResponse)
def get_user(email: str | None = None, db: Session = Depends(get_db),
             current_email: str = Depends(get_current_email)):
    """get basic user info"""
    
    if email:
        require_owner(email, current_email)
    return current_user(db, current_email)
