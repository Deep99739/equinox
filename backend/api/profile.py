# profile api endpoints

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db, User, UserProfile
from schemas import UserProfileCreate, UserProfileUpdate, UserProfileResponse, UserResponse

router = APIRouter(prefix="/profile", tags=["profile"])

# hardcoded test user - will add auth later
TEST_USER_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"


@router.get("/", response_model=UserProfileResponse)
def get_profile(db: Session = Depends(get_db)):
    """get user profile"""
    
    user_id = UUID(TEST_USER_ID)
    
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="profile not found")
    
    return profile


@router.put("/", response_model=UserProfileResponse)
def update_profile(data: UserProfileUpdate, db: Session = Depends(get_db)):
    """update user profile"""
    
    user_id = UUID(TEST_USER_ID)
    
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="profile not found")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    
    return profile


@router.get("/user", response_model=UserResponse)
def get_user(db: Session = Depends(get_db)):
    """get basic user info"""
    
    user_id = UUID(TEST_USER_ID)
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    
    return user
