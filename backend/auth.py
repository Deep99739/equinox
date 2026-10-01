"""Session identity shared by API routes after Google OAuth."""

from fastapi import HTTPException, Request


def get_current_email(request: Request) -> str:
    email = request.session.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Sign in with Google")
    return email


def require_owner(requested_email: str, current_email: str) -> str:
    email = requested_email.strip().lower()
    if email != current_email:
        raise HTTPException(status_code=403, detail="Account does not match session")
    return email
