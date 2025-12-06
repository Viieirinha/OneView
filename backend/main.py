from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
import models
import csv
import io
import uuid
import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from database import engine, get_db

SECRET_KEY = "sua_chave_secreta_super_poderosa"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "teu_email@gmail.com"),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "tua_senha_de_app"),
    MAIL_FROM = os.getenv("MAIL_FROM", "teu_email@gmail.com"),
    MAIL_PORT = 587,
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

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

# --- SCHEMAS (ATUALIZADOS PARA PYDANTIC V2) ---
# Substituimos 'orm_mode = True' por 'from_attributes = True'

class LoginData(BaseModel):
    email: str
    password: str

class UsuarioCriar(BaseModel):
    email: str
    nome: str
    password: str
    cargo: str = "visitante"

class UsuarioUpdate(BaseModel):
    email: Optional[str] = None
    nome: Optional[str] = None
    password: Optional[str] = None
    cargo: Optional[str] = None

class TrocarSenhaSchema(BaseModel):
    nova_senha: str

class EsqueciSenhaSchema(BaseModel):
    email: EmailStr

class RedefinirSenhaTokenSchema(BaseModel):
    token: str
    nova_senha: str

class UsuarioDisplay(BaseModel):
    id: int
    email: str
    nome: str
    cargo: str
    primeiro_acesso: bool
    class Config: 
        from_attributes = True # <--- CORREÇÃO AQUI

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
        from_attributes = True # <--- CORREÇÃO AQUI

class PermissaoSchema(BaseModel):
    cargo: str
    relatorio_id: int

class ChamadoCriar(BaseModel):
    titulo: str
    descricao: str
    relatorio_id: Optional[int] = None
    nome_anexo: Optional[str] = None
    anexo_base64: Optional[str] = None

class ResolucaoSchema(BaseModel):
    feedback: str

class AvaliacaoSchema(BaseModel):
    nota: int

class ChamadoDisplay(BaseModel):
    id: int
    titulo: str
    descricao: str
    status: str
    autor_email: str
    data_criacao: str
    relatorio_id: Optional[int] = None
    tecnico: Optional[str] = None
    nome_anexo: Optional[str] = None
    anexo_base64: Optional[str] = None
    resolucao: Optional[str] = None
    avaliacao: Optional[int] = None
    codigo: Optional[str] = None

    class Config: 
        from_attributes = True # <--- CORREÇÃO AQUI

class LogDisplay(BaseModel):
    id: int
    usuario: str
    acao: str
    detalhe: str
    data_hora: str
    class Config: 
        from_attributes = True # <--- CORREÇÃO AQUI

# --- FUNÇÕES ---
def verificar_senha(senha_pura, senha_hash): return pwd_context.verify(senha_pura, senha_hash)
def criar_hash_senha(senha): return pwd_context.hash(senha)
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
    except JWTError: raise HTTPException(status_code=401)
    usuario = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    if usuario is None: raise HTTPException(status_code=401)
    return usuario

def registrar_log(db: Session, usuario: str, acao: str, detalhe: str):
    agora = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    novo_log = models.Log(usuario=usuario, acao=acao, detalhe=detalhe, data_hora=agora)
    db.add(novo_log)
    db.commit()

def formatar_chamado(chamado):
    chamado.codigo = f"t_{chamado.id:04d}"
    return chamado

# --- ROTAS ---

@app.post("/setup-inicial")
def setup_inicial(db: Session = Depends(get_db)):
    if not db.query(models.Usuario).filter(models.Usuario.email == "admin@oneview.com").first():
        novo = models.Usuario(email="admin@oneview.com", nome="Admin", senha_hash=criar_hash_senha("123456"), cargo="admin", primeiro_acesso=False)
        db.add(novo); db.commit()
        registrar_log(db, "SISTEMA", "SETUP", "Admin inicial criado")
        return {"mensagem": "Admin criado"}
    return {"mensagem": "Admin já existe"}

@app.post("/login")
def login(data: LoginData, db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.email == data.email).first()
    if not user or not verificar_senha(data.password, user.senha_hash):
        return {"status": "erro", "mensagem": "Login falhou"}
    token = criar_token(data={"sub": user.email})
    return {"status": "sucesso", "usuario": user.nome, "token": token, "permissoes": [user.cargo], "primeiro_acesso": user.primeiro_acesso}

@app.post("/trocar-senha-inicial")
def trocar_senha_inicial(dados: TrocarSenhaSchema, db: Session = Depends(get_db), user: models.Usuario = Depends(get_usuario_atual)):
    user.senha_hash = criar_hash_senha(dados.nova_senha)
    user.primeiro_acesso = False
    db.commit()
    registrar_log(db, user.email, "SENHA", "Trocou senha de primeiro acesso")
    return {"mensagem": "Senha atualizada"}

@app.post("/esqueci-senha")
async def esqueci_senha(dados: EsqueciSenhaSchema, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.email == dados.email).first()
    if not user: return {"mensagem": "Se o email existir, as instruções foram enviadas."}
    token_recuperacao = str(uuid.uuid4())
    user.reset_token = token_recuperacao
    db.commit()
    link = f"https://oneview-frontend.vercel.app/redefinir-senha?token={token_recuperacao}"
    if os.getenv("RENDER"):
         link = f"https://oneview-frontend.vercel.app/redefinir-senha?token={token_recuperacao}"
    message = MessageSchema(subject="Recuperação de Senha - OneView", recipients=[dados.email], body=f"<h3>Olá, {user.nome}</h3><p>Clica no link para redefinir:</p><a href='{link}'>Redefinir Palavra-passe</a>", subtype=MessageType.html)
    fm = FastMail(conf)
    background_tasks.add_task(fm.send_message, message)
    return {"mensagem": "Enviado"}

@app.post("/redefinir-senha-token")
def redefinir_senha_token(dados: RedefinirSenhaTokenSchema, db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.reset_token == dados.token).first()
    if not user: raise HTTPException(status_code=400, detail="Token inválido")
    user.senha_hash = criar_hash_senha(dados.nova_senha)
    user.reset_token = None; user.primeiro_acesso = False
    db.commit()
    registrar_log(db, user.email, "RECUPERACAO", "Redefiniu senha")
    return {"mensagem": "Senha redefinida"}

# --- CHAMADOS ---

@app.post("/chamados", response_model=ChamadoDisplay)
def criar_chamado(c: ChamadoCriar, db: Session = Depends(get_db), user: models.Usuario = Depends(get_usuario_atual)):
    hoje = datetime.now().strftime("%d/%m/%Y")
    novo = models.Chamado(
        titulo=c.titulo, 
        descricao=c.descricao, 
        autor_email=user.email, 
        status="aberto", 
        data_criacao=hoje, 
        relatorio_id=c.relatorio_id,
        nome_anexo=c.nome_anexo,
        anexo_base64=c.anexo_base64
    )
    db.add(novo); db.commit(); db.refresh(novo)
    registrar_log(db, user.email, "CHAMADO", f"Abriu chamado: {c.titulo}")
    return formatar_chamado(novo)

@app.get("/chamados", response_model=List[ChamadoDisplay])
def listar_chamados(db: Session = Depends(get_db), user: models.Usuario = Depends(get_usuario_atual)):
    if user.cargo == "admin": 
        chamados = db.query(models.Chamado).all()
    else:
        chamados = db.query(models.Chamado).filter(models.Chamado.autor_email == user.email).all()
    
    return [formatar_chamado(c) for c in chamados]

@app.put("/chamados/{id}/resolver")
def resolver_chamado(id: int, dados: ResolucaoSchema, db: Session = Depends(get_db), user: models.Usuario = Depends(get_usuario_atual)):
    if user.cargo != "admin": raise HTTPException(403)
    c = db.query(models.Chamado).filter(models.Chamado.id == id).first()
    if c:
        c.status = "resolvido"
        c.resolucao = dados.feedback
        db.commit()
        registrar_log(db, user.email, "CHAMADO", f"Resolveu {id}")
    return {"mensagem": "Resolvido"}

@app.put("/chamados/{id}/atribuir")
def atribuir_chamado(id: int, db: Session = Depends(get_db), user: models.Usuario = Depends(get_usuario_atual)):
    if user.cargo != "admin": raise HTTPException(403)
    c = db.query(models.Chamado).filter(models.Chamado.id == id).first()
    if c: c.tecnico = user.email; c.status = "em_andamento"; db.commit(); registrar_log(db, user.email, "CHAMADO", f"Assumiu {id}")
    return {"mensagem": "Atribuído"}

@app.put("/chamados/{id}/avaliar")
def avaliar_chamado(id: int, dados: AvaliacaoSchema, db: Session = Depends(get_db), user: models.Usuario = Depends(get_usuario_atual)):
    c = db.query(models.Chamado).filter(models.Chamado.id == id).first()
    if not c: raise HTTPException(404, "Não encontrado")
    if c.status != "resolvido": raise HTTPException(400, "Só pode avaliar chamados resolvidos")
    c.avaliacao = dados.nota
    db.commit()
    registrar_log(db, user.email, "AVALIACAO", f"Avaliou chamado {id} com {dados.nota} estrelas")
    return {"mensagem": "Avaliação registada"}

# --- OUTROS CRUDS ---
@app.post("/usuarios", response_model=UsuarioDisplay)
def criar_usuario(u: UsuarioCriar, db: Session = Depends(get_db), admin: models.Usuario = Depends(get_usuario_atual)):
    if db.query(models.Usuario).filter(models.Usuario.email == u.email).first(): raise HTTPException(400, "Email já existe")
    novo = models.Usuario(email=u.email, nome=u.nome, senha_hash=criar_hash_senha(u.password), cargo=u.cargo)
    db.add(novo); db.commit(); db.refresh(novo); registrar_log(db, admin.email, "CRIAR_USUARIO", f"Criou {u.email}"); return novo
@app.get("/usuarios", response_model=List[UsuarioDisplay])
def listar_usuarios(db: Session = Depends(get_db), u=Depends(get_usuario_atual)): return db.query(models.Usuario).all()
@app.put("/usuarios/{id}", response_model=UsuarioDisplay)
def atualizar_usuario(id: int, d: UsuarioUpdate, db: Session = Depends(get_db), admin: models.Usuario = Depends(get_usuario_atual)):
    u = db.query(models.Usuario).filter(models.Usuario.id == id).first()
    if not u: raise HTTPException(404)
    if d.nome: u.nome = d.nome
    if d.email: u.email = d.email
    if d.cargo: u.cargo = d.cargo
    if d.password: u.senha_hash = criar_hash_senha(d.password)
    db.commit(); db.refresh(u); registrar_log(db, admin.email, "EDITAR_USUARIO", f"Editou {u.email}"); return u
@app.delete("/usuarios/{id}")
def deletar_usuario(id: int, db: Session = Depends(get_db), admin: models.Usuario = Depends(get_usuario_atual)):
    u = db.query(models.Usuario).filter(models.Usuario.id == id).first()
    if not u: raise HTTPException(404)
    if u.email == "admin@oneview.com": raise HTTPException(400)
    db.delete(u); db.commit(); registrar_log(db, admin.email, "DELETAR_USUARIO", f"Removeu {u.email}"); return {"mensagem": "Deletado"}
@app.post("/relatorios", response_model=RelatorioDisplay)
def criar_relatorio(r: RelatorioSchema, db: Session = Depends(get_db), u=Depends(get_usuario_atual)):
    novo = models.Relatorio(titulo=r.titulo, url=r.url, categoria=r.categoria)
    db.add(novo); db.commit(); db.refresh(novo); registrar_log(db, u.email, "CRIAR_RELATORIO", f"Criou {r.titulo}"); return novo
@app.get("/relatorios", response_model=List[RelatorioDisplay])
def listar_relatorios_admin(db: Session = Depends(get_db), u=Depends(get_usuario_atual)): return db.query(models.Relatorio).all()
@app.delete("/relatorios/{id}")
def deletar_relatorio(id: int, db: Session = Depends(get_db), u=Depends(get_usuario_atual)):
    r = db.query(models.Relatorio).filter(models.Relatorio.id == id).first()
    if r: db.query(models.Permissao).filter(models.Permissao.relatorio_id == id).delete(); db.delete(r); db.commit(); registrar_log(db, u.email, "DELETAR_RELATORIO", f"Removeu {r.titulo}"); return {"mensagem": "Deletado"}
@app.get("/meus-relatorios", response_model=List[RelatorioDisplay])
def listar_meus_relatorios(db: Session = Depends(get_db), user: models.Usuario = Depends(get_usuario_atual)):
    if user.cargo == "admin": return db.query(models.Relatorio).all()
    return db.query(models.Relatorio).join(models.Permissao).filter(models.Permissao.cargo == user.cargo).all()
@app.post("/permissoes")
def definir_permissao(p: PermissaoSchema, db: Session = Depends(get_db), u=Depends(get_usuario_atual)):
    if not db.query(models.Permissao).filter(models.Permissao.cargo == p.cargo, models.Permissao.relatorio_id == p.relatorio_id).first():
        db.add(models.Permissao(cargo=p.cargo, relatorio_id=p.relatorio_id)); db.commit()
        registrar_log(db, u.email, "PERMISSAO", f"Deu acesso {p.relatorio_id} -> {p.cargo}")
    return {"mensagem": "Ok"}
@app.delete("/permissoes/{cargo}/{relatorio_id}")
def remover_permissao(cargo: str, relatorio_id: int, db: Session = Depends(get_db), u=Depends(get_usuario_atual)):
    db.query(models.Permissao).filter(models.Permissao.cargo == cargo, models.Permissao.relatorio_id == relatorio_id).delete(); db.commit()
    registrar_log(db, u.email, "PERMISSAO", f"Removeu acesso {relatorio_id} -> {cargo}")
    return {"mensagem": "Ok"}
@app.get("/permissoes")
def listar_permissoes(db: Session = Depends(get_db), u=Depends(get_usuario_atual)): return db.query(models.Permissao).all()
@app.get("/logs", response_model=List[LogDisplay])
def listar_logs(db: Session = Depends(get_db), user: models.Usuario = Depends(get_usuario_atual)):
    if user.cargo != "admin": raise HTTPException(403)
    return db.query(models.Log).order_by(models.Log.id.desc()).all()
@app.get("/logs/exportar")
def exportar_logs_csv(db: Session = Depends(get_db), user: models.Usuario = Depends(get_usuario_atual)):
    if user.cargo != "admin": raise HTTPException(403)
    logs = db.query(models.Log).all()
    output = io.StringIO(); writer = csv.writer(output)
    writer.writerow(['ID', 'Usuario', 'Acao', 'Detalhe', 'Data'])
    for log in logs: writer.writerow([log.id, log.usuario, log.acao, log.detalhe, log.data_hora])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=auditoria.csv"})