import React, { useState, useEffect } from 'react';
import { Users, FileText, Shield, ArrowLeft, MessageSquare, Activity } from 'lucide-react'; // Importe Activity
import { useNavigate, useLocation } from 'react-router-dom';
import GestaoUsuarios from './GestaoUsuarios'; 
import Relatorios from './Relatorios'; 
import Hierarquia from './Hierarquia';
import Chamados from './Chamados';
import Logs from './Logs'; // <--- IMPORTAR

export default function Administracao() {
  const navigate = useNavigate();
  const location = useLocation();
  const cargoUsuario = localStorage.getItem('cargoUsuario');
  
  const abaInicial = cargoUsuario === 'admin' ? 'usuarios' : 'chamados';
  const [abaAtiva, setAbaAtiva] = useState(abaInicial);

  const isAdmin = cargoUsuario === 'admin';

  useEffect(() => {
    if (location.state && location.state.aba) {
      if (!isAdmin && ['usuarios', 'relatorios', 'hierarquia', 'logs'].includes(location.state.aba)) {
        setAbaAtiva('chamados');
      } else {
        setAbaAtiva(location.state.aba);
      }
    }
  }, [location, isAdmin]);

  const btnClass = (nome) => `flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium transition ${abaAtiva === nome ? 'bg-white text-brand-blue border-b-2 border-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto mb-8 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Central de Administração</h1>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="flex overflow-x-auto gap-2 mb-6 border-b border-gray-200 pb-1">
          {isAdmin && (
            <>
                <button onClick={() => setAbaAtiva('usuarios')} className={btnClass('usuarios')}>
                    <Users size={18} /> <span className="whitespace-nowrap">Usuários</span>
                </button>
                <button onClick={() => setAbaAtiva('relatorios')} className={btnClass('relatorios')}>
                    <FileText size={18} /> <span className="whitespace-nowrap">Relatórios</span>
                </button>
                <button onClick={() => setAbaAtiva('hierarquia')} className={btnClass('hierarquia')}>
                    <Shield size={18} /> <span className="whitespace-nowrap">Permissões</span>
                </button>
                {/* ABA LOGS */}
                <button onClick={() => setAbaAtiva('logs')} className={btnClass('logs')}>
                    <Activity size={18} /> <span className="whitespace-nowrap">Auditoria</span>
                </button>
            </>
          )}
          <button onClick={() => setAbaAtiva('chamados')} className={btnClass('chamados')}>
            <MessageSquare size={18} /> <span className="whitespace-nowrap">Chamados</span>
          </button>
        </div>

        <div className="animate-fadeIn">
          {abaAtiva === 'usuarios' && isAdmin && <GestaoUsuarios modoEmbutido={true} />}
          {abaAtiva === 'relatorios' && isAdmin && <Relatorios modoEmbutido={true} />}
          {abaAtiva === 'hierarquia' && isAdmin && <Hierarquia />}
          {abaAtiva === 'logs' && isAdmin && <Logs />} {/* COMPONENTE LOGS */}
          {abaAtiva === 'chamados' && <Chamados />}
        </div>
      </div>
    </div>
  );
}