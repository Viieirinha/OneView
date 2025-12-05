# backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Tenta pegar a URL do banco das variáveis de ambiente (Nuvem)
# Se não encontrar, usa o SQLite local (Computador)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_ztAFmK8D7heV@ep-wispy-lab-acyijlq2-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")

# Ajuste necessário para o Render (ele às vezes dá o link com "postgres://" em vez de "postgresql://")
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configuração condicional
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    # Configuração para SQLite
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # Configuração para PostgreSQL (NeonDB)
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()