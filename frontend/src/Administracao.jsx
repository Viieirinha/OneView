import React, { useState } from 'react';
import { Users, FileText, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GestaoUsuarios from './GestaoUsuarios'; // Vamos reutilizar, mas precisa ajustar css
import Relatorios from './Relatorios'; // Vamos reutilizar
import Hierarquia from './Hierarquia';

export default function Administracao() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('usuarios');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Central de Administração</h1>
      </div>

      <div className="max-w-6xl mx-auto">
        
        {/* Menu de Abas */}
        <div className="flex flex-col md:flex-row gap-2 mb-6 border-b border-gray-200 pb-1">
          <button 
            onClick={() => setAbaAtiva('usuarios')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition ${abaAtiva === 'usuarios' ? 'bg-white text-brand-blue border-b-2 border-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            <Users size={18} /> Gestão de Usuários
          </button>
          <button 
            onClick={() => setAbaAtiva('relatorios')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition ${abaAtiva === 'relatorios' ? 'bg-white text-brand-blue border-b-2 border-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            <FileText size={18} /> Gestão de Relatórios
          </button>
          <button 
            onClick={() => setAbaAtiva('hierarquia')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition ${abaAtiva === 'hierarquia' ? 'bg-white text-brand-blue border-b-2 border-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            <Shield size={18} /> Hierarquia & Permissões
          </button>
        </div>

        {/* Conteúdo da Aba */}
        <div className="animate-fadeIn">
          {abaAtiva === 'usuarios' && <GestaoUsuarios modoEmbutido={true} />}
          {abaAtiva === 'relatorios' && <Relatorios modoEmbutido={true} />}
          {abaAtiva === 'hierarquia' && <Hierarquia />}
        </div>

      </div>
    </div>
  );
}