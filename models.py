from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True) # Nome do Colaborador
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # Ex: "admin", "vendedor", "gerente"
    sector = Column(String) # Ex: "comercial", "financeiro"
    is_active = Column(Boolean, default=True)

class Dashboard(Base):
    __tablename__ = "dashboards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    embed_url = Column(String) # COMENTÁRIO: Link público ou embed do Power BI
    allowed_sectors = Column(String) # Ex: "comercial,todos"
    allowed_roles = Column(String) # Ex: "gerente,admin"