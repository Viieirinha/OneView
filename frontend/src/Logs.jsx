import React, { useState, useEffect } from 'react';
import { Download, Activity, Search } from 'lucide-react';
import { baseURL } from './api';

export default function Logs() {
  const token = localStorage.getItem('token');
  const [logs, setLogs] = useState([]);
  const [busca, setBusca] = useState('');

  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  useEffect(() => {
    carregarLogs();
  }, []);

  const carregarLogs = async () => {
    const response = await fetch(`${baseURL}/logs`, { headers: authHeaders });
    if (response.ok) {
        setLogs(await response.json());
    }
  };

  const baixarCSV = async () => {
    // Para baixar arquivo, usamos window.open com o token é complicado,
    // então vamos fazer um fetch e criar um blob
    const response = await fetch(`${baseURL}/logs/exportar`, { headers: { 'Authorization': `Bearer ${token}` } });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "auditoria_oneview.csv";
    a.click();
  };

  const logsFiltrados = logs.filter(l => 
    l.usuario.toLowerCase().includes(busca.toLowerCase()) || 
    l.acao.toLowerCase().includes(busca.toLowerCase()) ||
    l.detalhe.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="text-brand-blue" /> Logs de Auditoria
        </h2>
        
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                    placeholder="Buscar logs..." 
                    className="pl-10 pr-4 py-2 border rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-brand-blue outline-none"
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                />
            </div>
            <button 
                onClick={baixarCSV}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition"
            >
                <Download size={18} /> CSV
            </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
                <tr>
                    <th className="p-3 font-bold text-gray-600">Data/Hora</th>
                    <th className="p-3 font-bold text-gray-600">Usuário</th>
                    <th className="p-3 font-bold text-gray-600">Ação</th>
                    <th className="p-3 font-bold text-gray-600">Detalhe</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {logsFiltrados.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                        <td className="p-3 text-gray-500 whitespace-nowrap">{log.data_hora}</td>
                        <td className="p-3 font-bold text-brand-blue">{log.usuario}</td>
                        <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                ${log.acao.includes('DELETAR') ? 'bg-red-100 text-red-700' : 
                                  log.acao.includes('CRIAR') ? 'bg-green-100 text-green-700' : 
                                  'bg-blue-100 text-blue-700'}`}>
                                {log.acao}
                            </span>
                        </td>
                        <td className="p-3 text-gray-700">{log.detalhe}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        {logsFiltrados.length === 0 && <p className="text-center py-8 text-gray-400">Nenhum registro encontrado.</p>}
      </div>
    </div>
  );
}