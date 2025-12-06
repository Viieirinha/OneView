import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { baseURL } from './api';
import { toast } from 'sonner';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${baseURL}/esqueci-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      // Por segurança, mostramos sempre sucesso, mesmo que o e-mail não exista
      toast.success("Se o e-mail estiver registado, receberá as instruções em breve.");
      
      // Limpa o campo
      setEmail('');
      
    } catch (error) {
      toast.error("Erro ao tentar enviar o e-mail. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-brand-light">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl border-t-4 border-blue-500">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="text-blue-600" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Recuperar Palavra-passe</h1>
          <p className="text-gray-500 text-sm mt-2">
            Introduza o seu e-mail corporativo para receber o link de redefinição.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="seu.email@oneview.com"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-bold rounded-md transition duration-300 shadow-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'A enviar...' : 'Enviar Link de Recuperação'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-brand-blue flex items-center justify-center gap-1 transition">
            <ArrowLeft size={16} /> Voltar ao Login
          </Link>
        </div>
      </div>
    </div>
  );
}