# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
import models
from database import engine, get_db

SECRET_KEY = "sua_chave_secreta_super_poderosa"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI()
models.Base.metadata.create_all(bind=engine)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    cargo: str = "visitante" # Novo campo obrigatório

class UsuarioUpdate(BaseModel):
    email: Optional[str] = None
    nome: Optional[str] = None
    password: Optional[str] = None
    cargo: Optional[str] = None

class UsuarioDisplay(BaseModel):
    id: int
    email: str
    nome: str
    cargo: str
    class Config:
        orm_mode = True

class RelatorioSchema(BaseModel):
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

class PermissaoSchema(BaseModel):
    cargo: str
    relatorio_id: int

# --- FUNÇÕES ---
def verificar_senha(senha_pura, senha_hash):
    return pwd_context.verify(senha_pura, senha_hash)

def criar_hash_senha(senha):
    return pwd_context.hash(senha)

def criar_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_usuario_atual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None: raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401)
    usuario = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    if usuario is None: raise HTTPException(status_code=401)
    return usuario

# --- ROTAS ---

@app.post("/setup-inicial")
def setup_inicial(db: Session = Depends(get_db)):
    if not db.query(models.Usuario).filter(models.Usuario.email == "admin@oneview.com").first():
        novo = models.Usuario(email="admin@oneview.com", nome="Admin", senha_hash=criar_hash_senha("123456"), cargo="admin")
        db.add(novo)
        db.commit()
        return {"mensagem": "Admin criado"}
    return {"mensagem": "Admin já existe"}

@app.post("/login")
def login(data: LoginData, db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.email == data.email).first()
    if not user or not verificar_senha(data.password, user.senha_hash):
        return {"status": "erro", "mensagem": "Login falhou"}
    token = criar_token(data={"sub": user.email})
    return {"status": "sucesso", "usuario": user.nome, "token": token}

# --- USUÁRIOS ---
@app.post("/usuarios", response_model=UsuarioDisplay)
def criar_usuario(usuario: UsuarioCriar, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_usuario_atual)):
    if db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first():
        raise HTTPException(status_code=400, detail="Email já existe")
    novo = models.Usuario(email=usuario.email, nome=usuario.nome, senha_hash=criar_hash_senha(usuario.password), cargo=usuario.cargo)
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

@app.get("/usuarios", response_model=List[UsuarioDisplay])
def listar_usuarios(db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_usuario_atual)):
    return db.query(models.Usuario).all()

@app.put("/usuarios/{id}", response_model=UsuarioDisplay)
def atualizar_usuario(id: int, dados: UsuarioUpdate, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_usuario_atual)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == id).first()
    if not usuario: raise HTTPException(404, "Não encontrado")
    if dados.nome: usuario.nome = dados.nome
    if dados.email: usuario.email = dados.email
    if dados.cargo: usuario.cargo = dados.cargo
    if dados.password: usuario.senha_hash = criar_hash_senha(dados.password)
    db.commit()
    db.refresh(usuario)
    return usuario

@app.delete("/usuarios/{id}")
def deletar_usuario(id: int, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_usuario_atual)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == id).first()
    if not usuario: raise HTTPException(404)
    if usuario.email == "admin@oneview.com": raise HTTPException(400, "Não pode deletar Admin")
    db.delete(usuario)
    db.commit()
    return {"mensagem": "Deletado"}

# --- RELATÓRIOS (Admin vê tudo) ---
@app.post("/relatorios", response_model=RelatorioDisplay)
def criar_relatorio(r: RelatorioSchema, db: Session = Depends(get_db), u=Depends(get_usuario_atual)):
    novo = models.Relatorio(titulo=r.titulo, url=r.url, categoria=r.categoria)
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

@app.get("/relatorios", response_model=List[RelatorioDisplay])
def listar_relatorios_admin(db: Session = Depends(get_db), u=Depends(get_usuario_atual)):
    return db.query(models.Relatorio).all()

@app.delete("/relatorios/{id}")
def deletar_relatorio(id: int, db: Session = Depends(get_db), u=Depends(get_usuario_atual)):
    r = db.query(models.Relatorio).filter(models.Relatorio.id == id).first()
    if r:
        # Apaga também as permissões associadas
        db.query(models.Permissao).filter(models.Permissao.relatorio_id == id).delete()
        db.delete(r)
        db.commit()
    return {"mensagem": "Deletado"}

# --- HIERARQUIA & PERMISSÕES ---

# Rota para o Dashboard: Traz apenas o que o cargo permite!
@app.get("/meus-relatorios", response_model=List[RelatorioDisplay])
def listar_meus_relatorios(db: Session = Depends(get_db), user: models.Usuario = Depends(get_usuario_atual)):
    if user.cargo == "admin":
        return db.query(models.Relatorio).all() # Admin vê tudo
    
    # Busca relatórios onde existe uma permissão para o cargo do usuário
    relatorios = db.query(models.Relatorio).join(models.Permissao).filter(models.Permissao.cargo == user.cargo).all()
    return relatorios

# Define permissão (Ligar Cargo -> Relatório)
@app.post("/permissoes")
def definir_permissao(p: PermissaoSchema, db: Session = Depends(get_db), u=Depends(get_usuario_atual)):
    # Evita duplicatas
    existe = db.query(models.Permissao).filter(models.Permissao.cargo == p.cargo, models.Permissao.relatorio_id == p.relatorio_id).first()
    if not existe:
        nova = models.Permissao(cargo=p.cargo, relatorio_id=p.relatorio_id)
        db.add(nova)
        db.commit()
    return {"mensagem": "Permissão adicionada"}

# Remove permissão
@app.delete("/permissoes/{cargo}/{relatorio_id}")
def remover_permissao(cargo: str, relatorio_id: int, db: Session = Depends(get_db), u=Depends(get_usuario_atual)):
    db.query(models.Permissao).filter(models.Permissao.cargo == cargo, models.Permissao.relatorio_id == relatorio_id).delete()
    db.commit()
    return {"mensagem": "Permissão removida"}

# Lista todas as permissões (Para a tela de admin)
@app.get("/permissoes")
def listar_permissoes(db: Session = Depends(get_db), u=Depends(get_usuario_atual)):
    return db.query(models.Permissao).all()