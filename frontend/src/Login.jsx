// src/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  
  // Estados para guardar os dados do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState(''); // Para mostrar mensagens de erro
  const [loading, setLoading] = useState(false); // Para mostrar "Carregando..."

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro(''); // Limpa erros antigos
    setLoading(true);

    try {
      // 1. FAZ A CHAMADA PARA O SEU BACKEND PYTHON
      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      // 2. VERIFICA A RESPOSTA DO BACKEND
      if (data.status === "sucesso") {
        // Login Aprovado!
        // Salva o nome real que veio do banco de dados (backend)
        localStorage.setItem('usuarioLogado', data.usuario);
        
        // (Opcional) Salvar token para usar depois
        localStorage.setItem('token', data.token);

        navigate('/dashboard');
      } else {
        // Login Recusado (Senha errada etc)
        setErro(data.mensagem || 'Erro ao tentar fazer login');
      }

    } catch (error) {
      setErro('Erro de conexão: O backend está ligado?');
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
          
          {/* Mensagem de Erro (Só aparece se tiver erro) */}
          {erro && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition"
              placeholder="admin@oneview.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Agora estamos salvando a senha
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox text-brand-orange rounded" />
              <span className="ml-2 text-gray-600">Lembrar-me</span>
            </label>
            <a href="#" className="text-brand-blue hover:text-brand-orange transition font-medium">
              Esqueceu a senha?
            </a>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-bold rounded-md transition duration-300 shadow-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-orange hover:bg-orange-600 hover:shadow-lg'}`}
          >
            {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}