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
    # 2. LIMPEZA E CORREÇÃO
    SQLALCHEMY_DATABASE_URL = url_ambiente.strip().strip('"').strip("'")
    
    # Corrige o protocolo para o formato que o SQLAlchemy exige
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 3. Criação do Motor de Banco de Dados (Com proteção contra quedas)
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # Configuração para PostgreSQL (Nuvem)
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_pre_ping=True,   # <--- O SEGREDO: Testa a conexão antes de usar
        pool_recycle=300,     # Recicla conexões a cada 5 minutos
        pool_size=5,          # Mantém 5 conexões abertas
        max_overflow=10       # Permite criar mais 10 se estiver muito cheio
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()