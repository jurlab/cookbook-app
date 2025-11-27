from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# defaults to sqlite for easy local testing, can switch to postgres
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cookbook.db")

# Configure connection pooling for better performance
connect_args = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
pool_args = {} if "sqlite" in SQLALCHEMY_DATABASE_URL else {
    "pool_size": 10,  # Number of connections to maintain
    "max_overflow": 20,  # Additional connections beyond pool_size
    "pool_pre_ping": True,  # Verify connections before using
    "pool_recycle": 3600,  # Recycle connections after 1 hour
}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
    **pool_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()