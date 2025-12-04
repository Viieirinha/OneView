// frontend/src/Relatorios.jsx
import React, { useState, useEffect } from 'react';
import { Trash2, PlusCircle, ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { baseURL } from './api';

// Recebe modoEmbutido para saber se está dentro da Administração
export default function Relatorios({ modoEmbutido }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [relatorios, setRelatorios] = useState([]);
  const [form, setForm] = useState({ titulo: '', url: '', categoria: 'Relatórios' });
  const [erro, setErro] = useState('');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const buscarRelatorios = async () => {
    try {
      const response = await fetch(`${baseURL}/relatorios`, { headers: authHeaders });
      if (response.ok) {
        const data = await response.json();
        setRelatorios(data);
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  useEffect(() => {
    if (!token) navigate('/');
    buscarRelatorios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      const response = await fetch(`${baseURL}/relatorios`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setForm({ titulo: '', url: '', categoria: 'Relatórios' });
        buscarRelatorios();
        alert("Relatório adicionado!");
      } else {
        setErro('Erro ao criar relatório');
      }
    } catch (error) {
      setErro('Erro de conexão');
    }
  };

  const handleDelete = async (id, titulo) => {
    if (!window.confirm(`Excluir "${titulo}"?`)) return;
    try {
      const response = await fetch(`${baseURL}/relatorios/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (response.ok) buscarRelatorios();
      else alert("Erro ao deletar");
    } catch (error) {
      alert("Erro de conexão");
    }
  };

  return (
    <div className={modoEmbutido ? "" : "min-h-screen bg-gray-50 p-8 font-sans text-gray-800"}>
      {!modoEmbutido && (
        <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="text-brand-blue" />
              Gestão de Relatórios
            </h1>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${!modoEmbutido ? 'max-w-4xl mx-auto' : ''}`}>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-600">
            <PlusCircle size={20} />
            Novo Relatório
          </h2>
          
          {erro && <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded">{erro}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Título do Dashboard</label>
              <input required type="text" className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Ex: Comercial" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Link Power BI</label>
              <input required type="url" className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="https://..." value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2">Adicionar</button>
          </form>
        </div>

        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Título</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Link</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {relatorios.map((rel) => (
                <tr key={rel.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    {rel.titulo}
                  </td>
                  <td className="p-4 text-gray-500 text-xs truncate max-w-[200px]">
                    {rel.url}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(rel.id, rel.titulo)}
                      className="text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-full"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {relatorios.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-gray-400">
                    Nenhum relatório cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}