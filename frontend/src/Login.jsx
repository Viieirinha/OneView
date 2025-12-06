import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <--- IMPORTAR LINK
import { baseURL } from './api';
import { toast } from 'sonner';

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
      const response = await fetch(`${baseURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.status === "sucesso") {
        localStorage.setItem('usuarioLogado', data.usuario);
        localStorage.setItem('token', data.token);
        
        const cargo = data.permissoes && data.permissoes.length > 0 ? data.permissoes[0] : 'visitante';
        localStorage.setItem('cargoUsuario', cargo); 

        toast.success("Login realizado com sucesso!");

        if (data.primeiro_acesso) {
            navigate('/primeiro-acesso');
        } else {
            navigate('/dashboard');
        }

      } else {
        const msgErro = data.mensagem || 'Erro ao tentar iniciar sessão';
        setErro(msgErro);
        toast.error(msgErro);
      }

    } catch (error) {
      const msgErro = 'Erro de conexão com o servidor.';
      setErro(msgErro);
      toast.error(msgErro);
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
          <p className="text-gray-500 text-sm mt-2">Inicie sessão para aceder aos indicadores</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          
          {erro && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center font-bold">
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
              placeholder="seu.email@oneview.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Palavra-passe</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox text-brand-orange rounded" />
              <span className="ml-2 text-gray-600">Lembrar-me</span>
            </label>
            
            {/* LINK CORRIGIDO AQUI */}
            <Link to="/esqueci-senha" className="text-brand-blue hover:text-brand-orange transition font-medium">
              Esqueceu-se da palavra-passe?
            </Link>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-bold rounded-md transition duration-300 shadow-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-orange hover:bg-orange-600 hover:shadow-lg'}`}
          >
            {loading ? 'A entrar...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}