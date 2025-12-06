import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Login from './Login';
import Dashboard from './Dashboard';
import Administracao from './Administracao';
import GestaoUsuarios from './GestaoUsuarios';
import Relatorios from './Relatorios';
import PrimeiroAcesso from './PrimeiroAcesso';
import EsqueciSenha from './EsqueciSenha';
import RedefinirSenha from './RedefinirSenha';
import RotaProtegida from './RotaProtegida';

export default function App() {
  return (
    <BrowserRouter>
      {/* Sistema de Notificações Global */}
      <Toaster richColors position="top-right" closeButton />
      
      <Routes>
        {/* --- ROTAS PÚBLICAS (Sem Login) --- */}
        <Route path="/" element={<Login />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        
        {/* --- ROTAS PROTEGIDAS (Exigem Login) --- */}
        
        {/* Dashboard Principal */}
        <Route 
          path="/dashboard" 
          element={
            <RotaProtegida>
              <Dashboard />
            </RotaProtegida>
          } 
        />
        
        {/* Rota Obrigatória para Primeiro Acesso */}
        <Route 
          path="/primeiro-acesso" 
          element={
            <RotaProtegida>
              <PrimeiroAcesso />
            </RotaProtegida>
          } 
        />
        
        {/* Central de Administração (Abas) */}
        <Route 
          path="/administracao" 
          element={
            <RotaProtegida>
              <Administracao />
            </RotaProtegida>
          } 
        />

        {/* Rotas Individuais (para acesso direto se necessário) */}
        <Route 
          path="/usuarios" 
          element={
            <RotaProtegida>
              <GestaoUsuarios />
            </RotaProtegida>
          } 
        />

        <Route 
          path="/relatorios" 
          element={
            <RotaProtegida>
              <Relatorios />
            </RotaProtegida>
          } 
        />

      </Routes>
    </BrowserRouter>
  );
}