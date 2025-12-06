from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Text
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    nome = Column(String)
    senha_hash = Column(String)
    cargo = Column(String)
    primeiro_acesso = Column(Boolean, default=True)
    reset_token = Column(String, nullable=True)

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
    
    # NOVAS COLUNAS (Anexo + Resolução)
    nome_anexo = Column(String, nullable=True)
    anexo_base64 = Column(Text, nullable=True)
    
    resolucao = Column(Text, nullable=True) # <--- NOVA COLUNA: O que foi feito

class Log(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, index=True)
    usuario = Column(String)
    acao = Column(String)
    detalhe = Column(String)
    data_hora = Column(String)