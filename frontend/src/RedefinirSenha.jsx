import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { baseURL } from './api';
import { toast } from 'sonner';

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Link inválido ou expirado.");
      navigate('/');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (senha !== confirmar) {
      toast.warning("As palavras-passe não coincidem!");
      return;
    }
    if (senha.length < 6) {
      toast.warning("A palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${baseURL}/redefinir-senha-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nova_senha: senha })
      });

      if (response.ok) {
        toast.success("Palavra-passe redefinida com sucesso! Pode entrar agora.");
        navigate('/');
      } else {
        const data = await response.json();
        toast.error(data.detail || "Erro ao redefinir palavra-passe.");
      }
    } catch (error) {
      toast.error("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-brand-light">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl border-t-4 border-green-500">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="text-green-600" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Nova Palavra-passe</h1>
          <p className="text-gray-500 text-sm mt-2">
            Defina a sua nova palavra-passe de acesso.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova Palavra-passe</label>
            <input 
              type="password" required 
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none" 
              placeholder="••••••••" 
              value={senha} onChange={e => setSenha(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Palavra-passe</label>
            <input 
              type="password" required 
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none" 
              placeholder="••••••••" 
              value={confirmar} onChange={e => setConfirmar(e.target.value)} 
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-bold rounded-md transition shadow-md ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {loading ? 'A guardar...' : 'Redefinir Palavra-passe'}
          </button>
        </form>
      </div>
    </div>
  );
}