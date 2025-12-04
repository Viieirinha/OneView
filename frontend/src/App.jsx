// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Administracao from './Administracao'; // <--- A Nova Central
import GestaoUsuarios from './GestaoUsuarios'; // Mantemos para acesso direto se necessário
import Relatorios from './Relatorios'; // Mantemos para acesso direto se necessário
import RotaProtegida from './RotaProtegida';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <RotaProtegida>
              <Dashboard />
            </RotaProtegida>
          } 
        />
        <Route 
          path="/administracao" 
          element={
            <RotaProtegida>
              <Administracao />
            </RotaProtegida>
          } 
        />
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