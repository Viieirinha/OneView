// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Relatorios from './Relatorios';
import RotaProtegida from './RotaProtegida';
import GestaoUsuarios from './GestaoUsuarios'; 

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
        
        {/* Rota de Usuários usando o componente novo */}
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