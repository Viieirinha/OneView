import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Tenta pegar a variável de ambiente (Nuvem)
url_ambiente = os.getenv("DATABASE_URL")

if not url_ambiente:
    # Se não houver variável, usa SQLite local (Computador)
    SQLALCHEMY_DATABASE_URL = "sqlite:///./oneview.db"
else:
    # 2. LIMPEZA E CORREÇÃO (Mantemos isso pois é vital)
    # Remove espaços e aspas extras que podem vir da configuração
    SQLALCHEMY_DATABASE_URL = url_ambiente.strip().strip('"').strip("'")
    
    # Corrige o protocolo para o formato que o SQLAlchemy exige
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 3. Criação do Motor de Banco de Dados
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()