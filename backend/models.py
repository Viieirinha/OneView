from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    nome = Column(String)
    senha_hash = Column(String)
    cargo = Column(String) # Ex: "comercial", "financeiro", "admin"

class Relatorio(Base):
    __tablename__ = "relatorios"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String)
    url = Column(String)
    categoria = Column(String)

# --- NOVA TABELA: Quem pode ver o quê ---
class Permissao(Base):
    __tablename__ = "permissoes"
    id = Column(Integer, primary_key=True, index=True)
    cargo = Column(String) # O nome do cargo (ex: "financeiro")
    relatorio_id = Column(Integer, ForeignKey("relatorios.id"))