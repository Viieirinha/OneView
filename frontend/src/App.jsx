// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Usuarios from './Usuarios';
import Relatorios from './Relatorios'; // <--- IMPORTAR
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
          path="/usuarios" 
          element={
            <RotaProtegida>
              <Usuarios />
            </RotaProtegida>
          } 
        />

        {/* <--- NOVA ROTA DE RELATÓRIOS ---> */}
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