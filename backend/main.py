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

# --- SCHEMAS ---
class LoginData(BaseModel):
    email: str
    password: str

class UsuarioCriar(BaseModel):
    email: str
    nome: str
    password: str
    cargo: str = "visitante"

# Schema para troca de senha
class TrocarSenhaSchema(BaseModel):
    nova_senha: str

class UsuarioDisplay(BaseModel):
    id: int
    email: str
    nome: str
    cargo: str
    primeiro_acesso: bool # <--- Novo campo no display
    class Config:
        orm_mode = True

# ... (Outros schemas: Relatorio, Permissao, Chamado - MANTENHA IGUAIS) ...
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

class ChamadoCriar(BaseModel):
    titulo: str
    descricao: str
    relatorio_id: Optional[int] = None

class ChamadoDisplay(BaseModel):
    id: int
    titulo: str
    descricao: str
    status: str
    autor_email: str
    data_criacao: str
    relatorio_id: Optional[int] = None
    tecnico: Optional[str] = None
    class Config:
        orm_mode = True

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
        # Admin já nasce com primeiro_acesso=False pois você já sabe a senha
        novo = models.Usuario(email="admin@oneview.com", nome="Admin", senha_hash=criar_hash_senha("123456"), cargo="admin", primeiro_acesso=False)
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
    
    return {
        "status": "sucesso", 
        "usuario": user.nome, 
        "token": token,
        "permissoes": [user.cargo],
        "primeiro_acesso": user.primeiro_acesso # <--- ENVIA O STATUS
    }

@app.post("/trocar-senha-inicial")
def trocar_senha_inicial(dados: TrocarSenhaSchema, db: Session = Depends(get_db), user: models.Usuario = Depends(get_usuario_atual)):
    user.senha_hash = criar_hash_senha(dados.nova_senha)
    user.primeiro_acesso = False
    
    db.commit()
    return {"mensagem": "Senha atualizada com sucesso"}


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

@app.delete("/usuarios/{id}")
def deletar_usuario(id: int, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_usuario_atual)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == id).first()
    if not usuario: raise HTTPException(404)
    if usuario.email == "admin@oneview.com": raise HTTPException(400, "Não pode deletar Admin")
    db.delete(usuario)
    db.commit()
    return {"mensagem": "Deletado"}


@app.post("/relatorios", response_model=RelatorioDisplay)
def criar_relatorio(r: RelatorioSchema, db: Session = Depends(get_db), u=Depends(get_usuario_atual)):
    novo = models.Relatorio(titulo=r.titulo, url=r.url, categoria=r.categoria)
    db.add(novo); db.commit(); db.refresh(novo); return novo

@app.get("/relatorios", response_model=List[RelatorioDisplay])
def listar_relatorios_admin(db: Session = Depends(get_db), u=Depends(get_usuario_atual)):
    return db.query(models.Relatorio).all()

@app.delete("/relatorios/{id}")
def deletar_relatorio(id: int, db: Session = Depends(get_db), u=Depends(get_usuario_atual)):
    r = db.query(models.Relatorio).filter(models.Relatorio.id == id).first()
    if r: db.query(models.Permissao).filter(models.Permissao.relatorio_id == id).delete(); db.delete(r); db.commit()
    return {"mensagem": "Deletado"}

@app.get("/meus-relatorios", response_model=List[RelatorioDisplay])
def listar_meus_relatorios(db: Session = Depends(get_db), user: models.Usuario = Depends(get_usuario_atual)):
    if user.cargo == "admin": return db.query(models.Relatorio).all()
    return db.query(models.Relatorio).join(models.Permissao).filter(models.Permissao.cargo == user.cargo).all()

@app.post("/permissoes")
def definir_permissao(p: PermissaoSchema, db: Session = Depends(get_db), u=Depends(get_usuario_atual)):
    if not db.query(models.Permissao).filter(models.Permissao.cargo == p.cargo, models.Permissao.relatorio_id == p.relatorio_id).first():
        db.add(models.Permissao(cargo=p.cargo, relatorio_id=p.relatorio_id)); db.commit()
    return {"mensagem": "Ok"}

@app.delete("/permissoes/{cargo}/{relatorio_id}")
def remover_permissao(cargo: str, relatorio_id: int, db: Session = Depends(get_db), u=Depends(get_usuario_atual)):
    db.query(models.Permissao).filter(models.Permissao.cargo == cargo, models.Permissao.relatorio_id == relatorio_id).delete(); db.commit()
    return {"mensagem": "Ok"}

@app.get("/permissoes")
def listar_permissoes(db: Session = Depends(get_db), u=Depends(get_usuario_atual)): return db.query(models.Permissao).all()

@app.post("/chamados", response_model=ChamadoDisplay)
def criar_chamado(c: ChamadoCriar, db: Session = Depends(get_db), user: models.Usuario = Depends(get_usuario_atual)):
    hoje = datetime.now().strftime("%d/%m/%Y")
    novo = models.Chamado(titulo=c.titulo, descricao=c.descricao, autor_email=user.email, status="aberto", data_criacao=hoje, relatorio_id=c.relatorio_id)
    db.add(novo); db.commit(); db.refresh(novo); return novo

@app.get("/chamados", response_model=List[ChamadoDisplay])
def listar_chamados(db: Session = Depends(get_db), user: models.Usuario = Depends(get_usuario_atual)):
    if user.cargo == "admin": return db.query(models.Chamado).all()
    return db.query(models.Chamado).filter(models.Chamado.autor_email == user.email).all()

@app.put("/chamados/{id}/resolver")
def resolver_chamado(id: int, db: Session = Depends(get_db), user: models.Usuario = Depends(get_usuario_atual)):
    if user.cargo != "admin": raise HTTPException(403)
    c = db.query(models.Chamado).filter(models.Chamado.id == id).first()
    if c: c.status = "resolvido"; db.commit()
    return {"mensagem": "Resolvido"}

@app.put("/chamados/{id}/atribuir")
def atribuir_chamado(id: int, db: Session = Depends(get_db), user: models.Usuario = Depends(get_usuario_atual)):
    if user.cargo != "admin": raise HTTPException(403)
    c = db.query(models.Chamado).filter(models.Chamado.id == id).first()
    if c: c.tecnico = user.email; c.status = "em_andamento"; db.commit()
    return {"mensagem": "Atribuído"}