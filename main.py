from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, database

# Cria as tabelas no banco automaticamente ao iniciar
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# --- CONFIGURAÇÃO DE SEGURANÇA (CORS) ---
# Necessário para o React conseguir falar com o Python
origins = [
    "http://localhost:5173", # Porta padrão do Vite/React
    # Adicione aqui o domínio de produção quando fizer o deploy
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROTAS DE EXEMPLO ---

@app.get("/")
def read_root():
    return {"message": "API do Portal BI Online"}

# Rota para buscar dashboards (Simulação de filtro)
@app.get("/dashboards/")
def get_dashboards(user_sector: str, db: Session = Depends(database.get_db)):
    # COMENTÁRIO: Aqui entrará a lógica de filtrar dashboards pelo setor do usuário
    return db.query(models.Dashboard).all() # Retorna todos por enquanto