// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Usuarios from './Usuarios';
import RotaProtegida from './RotaProtegida'; // <--- 1. Importe o segurança

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública (Qualquer um acessa) */}
        <Route path="/" element={<Login />} />

        {/* Rotas Protegidas (O Segurança vigia) */}
        <Route 
          path="/dashboard" 
          element={
            <RotaProtegida>
              <Dashboard />
            </RotaProtegida>
          } 
        />
        
        <Route 
          path="/usuarios" 
          element={
            <RotaProtegida>
              <Usuarios />
            </RotaProtegida>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}