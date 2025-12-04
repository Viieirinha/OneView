# backend/models.py
from sqlalchemy import Column, Integer, String
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    nome = Column(String)
    senha_hash = Column(String) # Nunca salvamos a senha real, só o hash!
    cargo = Column(String, default="usuario") # admin, gerente, usuario