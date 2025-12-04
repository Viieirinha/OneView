import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Administracao from './Administracao';
import GestaoUsuarios from './GestaoUsuarios';
import Relatorios from './Relatorios';
import PrimeiroAcesso from './PrimeiroAcesso'; // <--- IMPORTANTE: Importar o novo ecrã
import RotaProtegida from './RotaProtegida';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública (Login) */}
        <Route path="/" element={<Login />} />
        
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
        
        {/* Rota Obrigatória para quem tem a palavra-passe padrão */}
        <Route 
          path="/primeiro-acesso" 
          element={
            <RotaProtegida>
              <PrimeiroAcesso />
            </RotaProtegida>
          } 
        />
        
        {/* Central de Administração */}
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