# User token store with database persistence
# Tokens are stored in the UserToken table

from database import SessionLocal
from database.models import UserToken

# Keep in-memory cache for performance (avoids DB hit every call)
user_tokens_store = {}


def save_user_tokens(user_email: str, tokens: dict):
    """Save tokens to both memory cache and database"""
    user_email = user_email.lower()
    # Persist to database
    session = SessionLocal()
    try:
        # Check if token record exists
        existing = session.query(UserToken).filter(UserToken.user_email == user_email).first()
        
        if existing:
            # Update existing record
            existing.access_token = tokens.get('token')
            existing.refresh_token = tokens.get('refresh_token')
            existing.token_uri = tokens.get('token_uri')
            existing.client_id = tokens.get('client_id')
            existing.client_secret = tokens.get('client_secret')
            existing.scopes = tokens.get('scopes', [])
        else:
            # Create new record
            new_token = UserToken(
                user_email=user_email,
                access_token=tokens.get('token'),
                refresh_token=tokens.get('refresh_token'),
                token_uri=tokens.get('token_uri'),
                client_id=tokens.get('client_id'),
                client_secret=tokens.get('client_secret'),
                scopes=tokens.get('scopes', [])
            )
            session.add(new_token)
        
        session.commit()
        user_tokens_store[user_email] = tokens
    except Exception as e:
        session.rollback()
        raise RuntimeError("Could not save Google credentials") from e
    finally:
        session.close()


def get_user_tokens(user_email: str) -> dict:
    """Get tokens - check memory cache first, then database"""
    user_email = user_email.lower()
    # Check memory cache first
    if user_email in user_tokens_store:
        return user_tokens_store[user_email]
    
    # Not in cache, check database
    session = SessionLocal()
    try:
        token_record = session.query(UserToken).filter(UserToken.user_email == user_email).first()
        
        if token_record:
            # Reconstruct tokens dict (same format as Google OAuth)
            tokens = {
                'token': token_record.access_token,
                'refresh_token': token_record.refresh_token,
                'token_uri': token_record.token_uri,
                'client_id': token_record.client_id,
                'client_secret': token_record.client_secret,
                'scopes': token_record.scopes or []
            }
            # Cache it for next time
            user_tokens_store[user_email] = tokens
            return tokens
        
        return None
    except Exception as e:
        print(f"Error loading tokens from database: {e}")
        return None
    finally:
        session.close()


def load_all_tokens_to_cache():
    """Load all tokens from database to memory cache on startup"""
    session = SessionLocal()
    try:
        all_tokens = session.query(UserToken).all()
        for token_record in all_tokens:
            tokens = {
                'token': token_record.access_token,
                'refresh_token': token_record.refresh_token,
                'token_uri': token_record.token_uri,
                'client_id': token_record.client_id,
                'client_secret': token_record.client_secret,
                'scopes': token_record.scopes or []
            }
            user_tokens_store[token_record.user_email] = tokens
        print(f"Loaded {len(all_tokens)} tokens from database")
    except Exception as e:
        print(f"Error loading tokens from database: {e}")
    finally:
        session.close()
