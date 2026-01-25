# db connection setup
#  sqlalchemy with neon postgres

import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# grab from env, no fallback in prod
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set - check your .env file")

# connection pool settings for neon
engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True, 
    pool_size=5,
    max_overflow=10
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """fastapi dependency - yields a db session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_connection():
    """quick check if db is reachable"""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"db connection failed: {e}")
        return False
