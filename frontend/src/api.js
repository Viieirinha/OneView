// frontend/src/api.js

// --- CONFIGURAÇÃO DE DEPLOY ---
// Quando você subir o Backend no Render, ele vai te dar um link (ex: https://oneview-api.onrender.com).
// Você vai colar esse link aqui dentro das aspas:
export const RENDER_URL = "https://oneview-m7x6.onrender.com"; 

// --- LÓGICA AUTOMÁTICA ---
// Se o site estiver rodando no seu computador (localhost), usa o Python local.
// Se estiver rodando na internet (Vercel), usa o link do Render.
export const baseURL = window.location.hostname.includes('localhost')
  ? 'http://127.0.0.1:8000'
  : RENDER_URL;