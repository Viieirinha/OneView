from sqlalchemy import Column, Integer, String, ForeignKey, Boolean # <--- ADICIONE Boolean
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

# --- NOVA TABELA: Quem pode ver o quê ---
class Permissao(Base):
    __tablename__ = "permissoes"
    id = Column(Integer, primary_key=True, index=True)
    cargo = Column(String) # O nome do cargo (ex: "financeiro")
    relatorio_id = Column(Integer, ForeignKey("relatorios.id"))

class Chamado(Base):
    __tablename__ = "chamados"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String)
    descricao = Column(String)
    status = Column(String, default="aberto") # aberto, em_andamento, resolvido
    autor_email = Column(String)
    data_criacao = Column(String)
    relatorio_id = Column(Integer, ForeignKey("relatorios.id"), nullable=True)
    
    # NOVA COLUNA: Quem está atendendo esse chamado
    tecnico = Column(String, nullable=True)