# backend/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import List
import models
from database import engine, get_db

# 1. Configurações Iniciais
app = FastAPI()
models.Base.metadata.create_all(bind=engine)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 2. Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Modelos de Dados
class LoginData(BaseModel):
    email: str
    password: str

class UsuarioCriar(BaseModel):
    email: str
    nome: str
    password: str

class UsuarioDisplay(BaseModel):
    id: int
    email: str
    nome: str
    cargo: str

    class Config:
        orm_mode = True

# 4. Funções Auxiliares
def verificar_senha(senha_pura, senha_hash):
    return pwd_context.verify(senha_pura, senha_hash)

def criar_hash_senha(senha):
    return pwd_context.hash(senha)

# 5. ROTAS (Endpoints)

@app.get("/")
def read_root():
    return {"message": "API OneView Online! 🚀"}

@app.post("/setup-inicial")
def setup_inicial(db: Session = Depends(get_db)):
    usuario_existente = db.query(models.Usuario).filter(models.Usuario.email == "admin@oneview.com").first()
    if usuario_existente:
        return {"mensagem": "Usuário admin já existe!"}
    
    novo_usuario = models.Usuario(
        email="admin@oneview.com",
        nome="Administrador Supremo",
        senha_hash=criar_hash_senha("123456"),
        cargo="admin"
    )
    db.add(novo_usuario)
    db.commit()
    return {"mensagem": "Usuário Admin criado com sucesso!"}

@app.post("/login")
def login(data: LoginData, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.email == data.email).first()

    if not usuario or not verificar_senha(data.password, usuario.senha_hash):
        return {"status": "erro", "mensagem": "Email ou senha incorretos"}
    
    return {
        "status": "sucesso",
        "usuario": usuario.nome,
        "token": "token_ficticio_123",
        "permissoes": [usuario.cargo]
    }

# --- GESTÃO DE USUÁRIOS ---

@app.post("/usuarios", response_model=UsuarioDisplay)
def criar_usuario(usuario: UsuarioCriar, db: Session = Depends(get_db)):
    db_usuario = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if db_usuario:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    novo_usuario = models.Usuario(
        email=usuario.email,
        nome=usuario.nome,
        senha_hash=criar_hash_senha(usuario.password),
        cargo="usuario"
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario

@app.get("/usuarios", response_model=List[UsuarioDisplay])
def listar_usuarios(db: Session = Depends(get_db)):
    usuarios = db.query(models.Usuario).all()
    return usuarios

# ROTA NOVA: DELETAR
@app.delete("/usuarios/{id}")
def deletar_usuario(id: int, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == id).first()
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    if usuario.email == "admin@oneview.com":
         raise HTTPException(status_code=400, detail="Não é possível deletar o Admin Supremo")

    db.delete(usuario)
    db.commit()
    return {"mensagem": "Usuário deletado com sucesso"}