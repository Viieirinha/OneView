// frontend/src/PrimeiroAcesso.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { baseURL } from './api';

export default function PrimeiroAcesso() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (senha !== confirmar) {
      setErro("As senhas não coincidem!");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      const response = await fetch(`${baseURL}/trocar-senha-inicial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nova_senha: senha })
      });

      if (response.ok) {
        alert("Senha atualizada com sucesso! Bem-vindo.");
        navigate('/dashboard');
      } else {
        setErro("Erro ao atualizar senha.");
      }
    } catch (error) {
      setErro("Erro de conexão.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-brand-light">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl border-t-4 border-yellow-500">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="text-yellow-600" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Primeiro Acesso</h1>
          <p className="text-gray-500 text-sm mt-2">
            Por segurança, você precisa definir uma nova senha pessoal para continuar.
          </p>
        </div>

        <form onSubmit={handleSalvar} className="space-y-4">
          {erro && <div className="p-3 bg-red-100 text-red-700 rounded text-sm text-center">{erro}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
            <input 
              type="password" required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 outline-none" 
              placeholder="••••••••" 
              value={senha} onChange={e => setSenha(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
            <input 
              type="password" required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 outline-none" 
              placeholder="••••••••" 
              value={confirmar} onChange={e => setConfirmar(e.target.value)} 
            />
          </div>

          <button type="submit" className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-md transition shadow-md">
            Definir Senha e Entrar
          </button>
        </form>
      </div>
    </div>
  );
}