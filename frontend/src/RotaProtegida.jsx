// frontend/src/RotaProtegida.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function RotaProtegida({ children }) {
  // 1. Verifica se existe um token salvo no navegador
  const token = localStorage.getItem('token');

  // 2. Se NÃO tiver token, manda de volta pro Login ("/")
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 3. Se tiver token, deixa entrar (Renderiza a página filha)
  return children;
}