import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Pega a variável de ambiente
raw_url = os.getenv("DATABASE_URL")

# --- BLOCO DE DIAGNÓSTICO E LIMPEZA ---
if not raw_url:
    print("⚠️ AVISO: DATABASE_URL não encontrada. Usando SQLite local.")
    SQLALCHEMY_DATABASE_URL = "sqlite:///./oneview.db"
else:
    # Mostra os primeiros caracteres para confirmar que leu algo (sem mostrar a senha)
    print(f"🔍 URL Original recebida (inicio): {raw_url[:15]}...")
    
    # Limpeza agressiva: remove espaços, quebras de linha e aspas simples/duplas
    SQLALCHEMY_DATABASE_URL = raw_url.strip().strip('"').strip("'")
    
    # Corrige o protocolo para o formato que o SQLAlchemy exige (postgres -> postgresql)
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    print("✅ URL processada e limpa para conexão.")

# --- TENTATIVA DE CONEXÃO ---
try:
    if "sqlite" in SQLALCHEMY_DATABASE_URL:
        # Configuração para SQLite (Local)
        engine = create_engine(
            SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
        )
    else:
        # Configuração para PostgreSQL (Nuvem)
        engine = create_engine(SQLALCHEMY_DATABASE_URL)
        print("🔌 Engine PostgreSQL criado com sucesso.")
        
except Exception as e:
    print(f"❌ ERRO CRÍTICO NA URL DO BANCO: {e}")
    # Fallback de emergência: cria um SQLite temporário só para o servidor não cair e podermos ler os logs
    print("⚠️ Ativando modo de emergência (SQLite temporário) para diagnóstico...")
    engine = create_engine("sqlite:///./emergencia.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()