import React from 'react';

// Dados simulados (depois virão da API Python)
const dashboards = [
    { id: 1, title: "Vendas Mensais", category: "Comercial" },
    { id: 2, title: "Fluxo de Caixa", category: "Financeiro" },
];

export default function DashboardList() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-blue mb-6">Dashboards Disponíveis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboards.map((dash) => (
          <div key={dash.id} className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition border-l-4 border-brand-orange">
            <h3 className="text-xl font-semibold text-gray-800">{dash.title}</h3>
            <span className="inline-block mt-2 px-3 py-1 text-xs font-bold text-blue-800 bg-blue-100 rounded-full">
                {dash.category}
            </span>
            
            <div className="mt-4 flex space-x-2">
                <button className="flex-1 bg-brand-blue text-white py-2 rounded hover:bg-blue-700">
                    Visualizar
                </button>
                {/* Botão de Reportar Erro */}
                <button className="px-4 py-2 border border-red-200 text-red-500 rounded hover:bg-red-50">
                    Reportar
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}