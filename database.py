from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- CONFIGURAÇÃO DO BANCO DE DADOS ---
# COMENTÁRIO IMPORTANTE: Altere a linha abaixo com suas credenciais do PostgreSQL.
# Formato: postgresql://usuario:senha@localhost:porta/nome_do_banco
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:suasenha@localhost:5432/portal_bi"

# Cria o motor de conexão
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Função para pegar a sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()