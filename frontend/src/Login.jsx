// frontend/src/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { baseURL } from './api'; // <--- Importando a inteligência

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      // Usa baseURL em vez de http://127.0.0.1:8000
      const response = await fetch(`${baseURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.status === "sucesso") {
        localStorage.setItem('usuarioLogado', data.usuario);
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        setErro(data.mensagem || 'Erro ao tentar fazer login');
      }

    } catch (error) {
      setErro('Erro de conexão com o servidor');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-brand-light">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl border-t-4 border-brand-orange">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-blue">Portal BI</h1>
          <p className="text-gray-500 text-sm mt-2">Faça login para acessar os indicadores</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          {erro && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">{erro}</div>}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange transition" placeholder="admin@oneview.com" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Senha</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange transition" placeholder="••••••••" /></div>
          <button type="submit" disabled={loading} className={`w-full py-3 text-white font-bold rounded-md transition duration-300 shadow-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-orange hover:bg-orange-600 hover:shadow-lg'}`}>{loading ? 'Entrando...' : 'Entrar no Sistema'}</button>
        </form>
      </div>
    </div>
  );
}