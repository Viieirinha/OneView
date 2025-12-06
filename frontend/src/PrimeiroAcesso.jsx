import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertTriangle } from 'lucide-react'; // <--- Importei AlertTriangle
import { baseURL } from './api';
import { toast } from 'sonner';

export default function PrimeiroAcesso() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');

  // ESTADO DO MODAL
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', action: null });

  // --- Lógica do Modal ---
  const pedirConfirmacao = (titulo, mensagem, acao) => {
    setConfirmModal({ show: true, title: titulo, message: mensagem, action: () => acao() });
  };

  const executarAcao = () => {
    if (confirmModal.action) confirmModal.action();
    setConfirmModal({ ...confirmModal, show: false });
  };
  // ----------------------

  const handleSalvar = (e) => {
    e.preventDefault();
    if (senha !== confirmar) {
      toast.warning("As palavras-passe não coincidem!");
      return;
    }
    if (senha.length < 6) {
      toast.warning("A palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }

    // Abre o Modal antes de enviar
    pedirConfirmacao(
        "Definir Nova Palavra-passe",
        "Tem a certeza que deseja definir esta palavra-passe? Precisará dela para os próximos acessos.",
        async () => {
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
                    toast.success("Palavra-passe definida com sucesso! Bem-vindo.");
                    navigate('/dashboard');
                } else {
                    toast.error("Erro ao atualizar a palavra-passe.");
                }
            } catch (error) {
                toast.error("Erro de conexão.");
            }
        }
    );
  };

  return (
    <div className="flex items-center justify-center h-screen bg-brand-light relative">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl border-t-4 border-yellow-500">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="text-yellow-600" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Primeiro Acesso</h1>
          <p className="text-gray-500 text-sm mt-2">
            Por segurança, precisa de definir uma nova palavra-passe pessoal para continuar.
          </p>
        </div>

        <form onSubmit={handleSalvar} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova Palavra-passe</label>
            <input 
              type="password" required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 outline-none" 
              placeholder="••••••••" 
              value={senha} onChange={e => setSenha(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Palavra-passe</label>
            <input 
              type="password" required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 outline-none" 
              placeholder="••••••••" 
              value={confirmar} onChange={e => setConfirmar(e.target.value)} 
            />
          </div>

          <button type="submit" className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-md transition shadow-md">
            Definir e Entrar
          </button>
        </form>
      </div>

      {/* --- MODAL DE CONFIRMAÇÃO --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-scaleIn">
                <div className="flex items-center gap-3 text-brand-orange mb-4">
                    <AlertTriangle size={28} />
                    <h3 className="text-lg font-bold text-gray-800">{confirmModal.title}</h3>
                </div>
                <p className="text-gray-600 mb-6">{confirmModal.message}</p>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium transition"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={executarAcao}
                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-bold transition shadow-sm"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}