import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-brand-light">
      {/* --- MENU LATERAL (SIDEBAR) --- */}
      <aside className="w-64 bg-brand-blue text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-blue-800">
            {/* Logo Menor para o Menu */}
            Portal BI
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
            {/* COMENTÁRIO: Estes itens devem vir dinamicamente do banco baseados no cargo */}
            <a href="#" className="block px-4 py-2 rounded hover:bg-brand-orange transition">
                Visão Geral
            </a>
            <a href="#" className="block px-4 py-2 rounded hover:bg-blue-700 transition">
                Comercial
            </a>
            <a href="#" className="block px-4 py-2 rounded hover:bg-blue-700 transition">
                Financeiro
            </a>
            
            {/* Item visível apenas para Admin */}
            <div className="mt-8 pt-4 border-t border-blue-700">
                <p className="text-xs text-gray-400 uppercase mb-2">Administração</p>
                <a href="/admin" className="block px-4 py-2 text-sm rounded hover:bg-red-500 transition">
                    Gerenciar Dashboards
                </a>
            </div>
        </nav>

        <div className="p-4 bg-blue-900">
            <p className="text-sm">Usuário: João</p>
            <button className="text-xs text-orange-300 hover:text-white">Sair</button>
        </div>
      </aside>

      {/* --- ÁREA DO CONTEÚDO (DASHBOARDS) --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}