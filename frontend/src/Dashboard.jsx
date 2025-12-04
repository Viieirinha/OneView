// frontend/src/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  BarChart3, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight, 
  Database, 
  Layout 
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const usuarioLogado = localStorage.getItem('usuarioLogado') || 'Visitante';
  
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [totalUsuarios, setTotalUsuarios] = useState(0); // <--- Estado para guardar a contagem

  const links = {
    visaoGeral: "https://app.powerbi.com/view?r=eyJrIjoiOTkwYzQ4ODEtMDAxOC00YmI1LWE1ZTctZDc4NTRhY2UwMjQ4IiwidCI6IjM3NWU5MGVlLTVlYTYtNGIyZS1iYThiLWM2YTRlMzBhMmJmNSJ9",
    vendas: "https://google.com",
    financeiro: "https://bing.com"
  };

  const [urlAtual, setUrlAtual] = useState(links.visaoGeral);
  const [tituloAtual, setTituloAtual] = useState('Visão Geral');

  // 1. BUSCA DADOS REAIS DO BACKEND
  useEffect(() => {
    const fetchDados = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/usuarios');
        if (response.ok) {
          const data = await response.json();
          setTotalUsuarios(data.length); // Conta quantos usuários vieram da lista
        }
      } catch (error) {
        console.error("Erro ao buscar contagem:", error);
      }
    };
    fetchDados();
  }, []);

  // 2. FUNÇÃO DE LOGOUT (Sair de verdade)
  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('token');
    navigate('/');
  };

  const carregarRelatorio = (titulo, url) => {
    setTituloAtual(titulo);
    setUrlAtual(url);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const hideWhenCollapsed = `transition-all duration-300 ${!sidebarOpen ? 'md:w-0 md:opacity-0 md:overflow-hidden' : 'md:w-auto md:opacity-100'}`;
  const justifyClass = !sidebarOpen ? 'md:justify-center px-2' : 'px-6';

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 bg-white border-r border-gray-200 flex flex-col 
        transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
        ${sidebarOpen ? 'md:w-64' : 'md:w-20'}
      `}>
        
        {/* Logo Area */}
        <div className={`h-16 flex items-center border-b border-gray-100 transition-all ${justifyClass}`}>
          <div className="text-2xl font-bold text-brand-blue flex items-center gap-2">
             <div className="w-8 h-8 min-w-[32px] bg-brand-orange rounded flex items-center justify-center text-white text-xs shadow-sm">BI</div>
             <span className={hideWhenCollapsed}>OneView</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto text-gray-500">
            <X size={24} />
          </button>
        </div>
        
        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <div className={`mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider transition-all ${!sidebarOpen ? 'md:text-center md:text-[10px]' : 'px-6'}`}>
            {sidebarOpen ? 'Administrativo' : 'Adm'}
          </div>
          <div className="mb-6">
            <a href="#" className={`flex items-center py-3 text-gray-600 hover:bg-gray-50 hover:text-brand-blue group transition-colors ${justifyClass}`}>
              <Settings size={20} className="min-w-[20px] text-gray-400 group-hover:text-brand-blue" />
              <span className={`ml-3 flex-1 ${hideWhenCollapsed}`}>Administração</span>
              <ChevronRight size={14} className={`text-gray-300 group-hover:text-brand-blue ${hideWhenCollapsed}`} />
            </a>
            <a href="#" className={`flex items-center py-3 text-gray-600 hover:bg-gray-50 hover:text-brand-blue group transition-colors ${justifyClass}`}>
              <Database size={20} className="min-w-[20px] text-gray-400 group-hover:text-brand-blue" />
              <span className={`ml-3 flex-1 ${hideWhenCollapsed}`}>Parâmetros</span>
              <ChevronRight size={14} className={`text-gray-300 group-hover:text-brand-blue ${hideWhenCollapsed}`} />
            </a>
          </div>

          <div className={`mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider transition-all ${!sidebarOpen ? 'md:text-center md:text-[10px]' : 'px-6'}`}>
            {sidebarOpen ? 'Relatórios' : 'Rel'}
          </div>
          <div className="mb-6 space-y-1">
            <button onClick={() => carregarRelatorio('Comercial', links.vendas)} className={`w-full flex items-center py-3 text-gray-600 hover:bg-gray-50 hover:text-brand-blue group transition-colors ${justifyClass}`}>
              <div className="w-2 h-2 min-w-[8px] rounded-full bg-gray-300 group-hover:bg-brand-blue"></div>
              <span className={`ml-3 flex-1 text-left ${hideWhenCollapsed}`}>Comercial</span>
              <ChevronRight size={14} className={`text-gray-300 group-hover:text-brand-blue ${hideWhenCollapsed}`} />
            </button>
            <button onClick={() => carregarRelatorio('Financeiro', links.financeiro)} className={`w-full flex items-center py-3 text-gray-600 hover:bg-gray-50 hover:text-brand-blue group transition-colors ${justifyClass}`}>
              <div className="w-2 h-2 min-w-[8px] rounded-full bg-gray-300 group-hover:bg-brand-blue"></div>
              <span className={`ml-3 flex-1 text-left ${hideWhenCollapsed}`}>Financeiro</span>
              <ChevronRight size={14} className={`text-gray-300 group-hover:text-brand-blue ${hideWhenCollapsed}`} />
            </button>
            <button className={`w-full flex items-center py-3 text-gray-600 hover:bg-gray-50 hover:text-brand-blue group transition-colors ${justifyClass}`}>
              <div className="w-2 h-2 min-w-[8px] rounded-full bg-gray-300 group-hover:bg-brand-blue"></div>
              <span className={`ml-3 flex-1 text-left ${hideWhenCollapsed}`}>Estoque</span>
              <ChevronRight size={14} className={`text-gray-300 group-hover:text-brand-blue ${hideWhenCollapsed}`} />
            </button>
          </div>
        </nav>

        {/* Footer Sidebar - Logout com ação */}
        <div className={`p-4 border-t border-gray-100 ${!sidebarOpen ? 'flex justify-center' : ''}`}>
          <button 
            onClick={handleLogout} 
            className={`flex items-center text-gray-500 hover:text-red-500 transition-colors text-sm font-medium rounded hover:bg-red-50 w-full ${sidebarOpen ? 'px-2 py-2' : 'p-2 justify-center'}`} 
            title="Sair"
          >
            <LogOut size={20} className={sidebarOpen ? "mr-2" : ""} />
            <span className={hideWhenCollapsed}>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 z-10 border-b border-gray-200">
          <div className="flex items-center text-gray-500 text-sm">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-4 text-gray-600 p-2 rounded hover:bg-gray-100 focus:outline-none">
              <Menu size={24} />
            </button>
            <LayoutDashboard size={16} className="mr-2 text-brand-blue" />
            <span className="mx-2 text-gray-300">/</span>
            <span className="font-medium text-gray-800">Home</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-700">{usuarioLogado}</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-sm overflow-hidden">
               <img src={`https://ui-avatars.com/api/?name=${usuarioLogado}&background=0D8ABC&color=fff`} alt="Avatar" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          
          <div className="mb-8">
            <h1 className="text-2xl font-light text-gray-800">
              Olá, <span className="font-semibold">{usuarioLogado}</span>
            </h1>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
              <div className="p-3 rounded-lg bg-green-50 text-green-600 mr-4">
                <BarChart3 size={24} />
              </div>
              <div>
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Conjunto de Dados</h3>
                <p className="text-2xl font-bold text-gray-700 mt-1">102</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600 mr-4">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Relatórios</h3>
                <p className="text-2xl font-bold text-gray-700 mt-1">28</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
              <div className="p-3 rounded-lg bg-blue-50 text-brand-blue mr-4">
                <Layout size={24} />
              </div>
              <div>
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Grupos</h3>
                <p className="text-2xl font-bold text-gray-700 mt-1">7</p>
              </div>
            </div>

             {/* Card 4 - USUÁRIOS (Agora Dinâmico) */}
             <div 
               onClick={() => navigate('/usuarios')} 
               className="cursor-pointer bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow hover:border-brand-orange group"
             >
              <div className="p-3 rounded-lg bg-orange-50 text-brand-orange mr-4 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Usuários</h3>
                {/* MOSTRA O NÚMERO REAL DO BANCO */}
                <p className="text-2xl font-bold text-gray-700 mt-1">
                    {totalUsuarios}
                </p>
              </div>
            </div>

          </div>

          {/* Power BI Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[600px] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-6 bg-brand-orange rounded-full block"></span>
                  {tituloAtual}
                </h3>
                <button className="text-xs font-semibold text-brand-blue hover:text-brand-orange transition-colors">
                  Expandir Tela
                </button>
            </div>
            <div className="flex-1 bg-gray-100 relative">
               <iframe 
                 title="Dashboard"
                 src={urlAtual}
                 className="w-full h-full absolute inset-0"
                 frameBorder="0"
                 allowFullScreen={true}
               />
            </div>
          </div>
          
          <footer className="mt-8 text-center text-xs text-gray-400 pb-4">
            Copyright © 2025 - Developed by OneView
          </footer>

        </div>
      </main>
    </div>
  );
}