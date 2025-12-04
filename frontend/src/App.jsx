// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Relatorios from './Relatorios';
import RotaProtegida from './RotaProtegida';

// --- VERIFIQUE ESTA LINHA (Linha ~6) ---
import GestaoUsuarios from './GestaoUsuarios'; 
// (Não pode estar escrito "import Usuarios ...")

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
        
        {/* --- VERIFIQUE ESTA ROTA (Linha ~28) --- */}
        <Route 
          path="/usuarios" 
          element={
            <RotaProtegida>
              {/* Tem que estar chamando o componente novo */}
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