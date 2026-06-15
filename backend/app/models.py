from sqlalchemy import Column, Integer, Float, String, Text, DateTime
from datetime import datetime, timezone
from .database import Base

class DesignHistory(Base):
    __tablename__ = "design_history"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    industry = Column(String, default="")
    category = Column(String, default="")
    total_score = Column(Integer, nullable=True)
    brightness = Column(Float)
    complexity = Column(Float)
    saliency = Column(Float)
    symmetry = Column(Float)
    space = Column(Float)
    colors = Column(String) # 리스트를 문자열로 저장
    metrics = Column(Text, default="{}") # 전체 16개 지표 JSON
    description = Column(Text) # AI 피드백 JSON
