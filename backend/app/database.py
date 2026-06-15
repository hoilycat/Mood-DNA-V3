from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./mood_dna.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def ensure_history_columns(engine):
    """기존 SQLite DB에 새 컬럼을 추가하는 경량 마이그레이션.
    create_all은 이미 존재하는 테이블의 컬럼을 추가하지 않으므로 직접 ALTER한다."""
    needed = {
        "created_at": "DATETIME",
        "industry": "VARCHAR DEFAULT ''",
        "category": "VARCHAR DEFAULT ''",
        "total_score": "INTEGER",
        "metrics": "TEXT DEFAULT '{}'",
    }
    with engine.connect() as conn:
        existing = {row[1] for row in conn.execute(text("PRAGMA table_info(design_history)"))}
        if not existing:
            return  # 테이블이 아직 없으면 create_all이 최신 스키마로 생성함
        for col, col_type in needed.items():
            if col not in existing:
                conn.execute(text(f"ALTER TABLE design_history ADD COLUMN {col} {col_type}"))
                print(f"[DB 마이그레이션] design_history.{col} 컬럼 추가")
        conn.commit()
