from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    nome = Column(String)
    senha_hash = Column(String)
    cargo = Column(String)
    primeiro_acesso = Column(Boolean, default=True) 

class Relatorio(Base):
    __tablename__ = "relatorios"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String)
    url = Column(String)
    categoria = Column(String)

class Permissao(Base):
    __tablename__ = "permissoes"
    id = Column(Integer, primary_key=True, index=True)
    cargo = Column(String)
    relatorio_id = Column(Integer, ForeignKey("relatorios.id"))

class Chamado(Base):
    __tablename__ = "chamados"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String)
    descricao = Column(String)
    status = Column(String, default="aberto")
    autor_email = Column(String)
    data_criacao = Column(String)
    relatorio_id = Column(Integer, ForeignKey("relatorios.id"), nullable=True)
    tecnico = Column(String, nullable=True)

# --- NOVA TABELA: LOGS DE AUDITORIA ---
class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    usuario = Column(String)      # Quem fez a ação (email)
    acao = Column(String)         # O que fez (ex: "Criou Usuário")
    detalhe = Column(String)      # Detalhes (ex: "Nome: João")
    data_hora = Column(String)    # Quando