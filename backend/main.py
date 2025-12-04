# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta
from jose import JWTError, jwt # Biblioteca nova
import models
from database import engine, get_db

# --- CONFIGURAÇÕES DE SEGURANÇA ---
SECRET_KEY = "sua_chave_secreta_super_poderosa" # Em produção, isso fica escondido
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI()
models.Base.metadata.create_all(bind=engine)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login") # Define onde pega o token

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Liberando geral por enquanto para facilitar o deploy depois
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELOS ---
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

class RelatorioCriar(BaseModel):
    titulo: str
    url: str
    categoria: str = "Relatórios"

class RelatorioDisplay(BaseModel):
    id: int
    titulo: str
    url: str
    categoria: str
    class Config:
        orm_mode = True

# --- FUNÇÕES ÚTEIS ---
def verificar_senha(senha_pura, senha_hash):
    return pwd_context.verify(senha_pura, senha_hash)

def criar_hash_senha(senha):
    return pwd_context.hash(senha)

def criar_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- O SEGURANÇA DO BACKEND ---
# Essa função vai ser chamada em toda rota protegida
def get_usuario_atual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    usuario = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    if usuario is None:
        raise credentials_exception
    return usuario

# --- ROTAS PÚBLICAS (Qualquer um acessa) ---

@app.get("/")
def read_root():
    return {"message": "API OneView Segura! 🔒"}

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
    
    # GERA O TOKEN REAL
    access_token = criar_token(data={"sub": usuario.email})
    
    return {
        "status": "sucesso",
        "usuario": usuario.nome,
        "token": access_token, # Token JWT válido
        "permissoes": [usuario.cargo]
    }

# --- ROTAS PROTEGIDAS (Precisa de Token) ---

# Adicionamos: usuario: models.Usuario = Depends(get_usuario_atual)

# 1. USUÁRIOS
@app.post("/usuarios", response_model=UsuarioDisplay)
def criar_usuario(usuario: UsuarioCriar, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_usuario_atual)):
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
def listar_usuarios(db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_usuario_atual)):
    return db.query(models.Usuario).all()

@app.delete("/usuarios/{id}")
def deletar_usuario(id: int, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_usuario_atual)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if usuario.email == "admin@oneview.com":
         raise HTTPException(status_code=400, detail="Não pode deletar o Admin")
    db.delete(usuario)
    db.commit()
    return {"mensagem": "Deletado"}

# 2. RELATÓRIOS
@app.post("/relatorios", response_model=RelatorioDisplay)
def criar_relatorio(relatorio: RelatorioCriar, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_usuario_atual)):
    novo_relatorio = models.Relatorio(
        titulo=relatorio.titulo,
        url=relatorio.url,
        categoria=relatorio.categoria
    )
    db.add(novo_relatorio)
    db.commit()
    db.refresh(novo_relatorio)
    return novo_relatorio

@app.get("/relatorios", response_model=List[RelatorioDisplay])
def listar_relatorios(db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_usuario_atual)):
    return db.query(models.Relatorio).all()

@app.delete("/relatorios/{id}")
def deletar_relatorio(id: int, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_usuario_atual)):
    relatorio = db.query(models.Relatorio).filter(models.Relatorio.id == id).first()
    if not relatorio:
        raise HTTPException(status_code=404, detail="Relatório não encontrado")
    db.delete(relatorio)
    db.commit()
    return {"mensagem": "Relatório deletado"}