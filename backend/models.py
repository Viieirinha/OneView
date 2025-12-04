# backend/models.py
from sqlalchemy import Column, Integer, String
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    nome = Column(String)
    senha_hash = Column(String)
    cargo = Column(String, default="usuario")

# --- NOVO: Tabela de Relatórios ---
class Relatorio(Base):
    __tablename__ = "relatorios"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String)         # Ex: "Comercial"
    url = Column(String)            # Ex: "https://app.powerbi.com/..."
    categoria = Column(String)      # Ex: "Relatórios", "Administrativo"