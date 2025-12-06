import React, { useState, useEffect } from 'react';
import { Trash2, PlusCircle, ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { baseURL } from './api';
import { toast } from 'sonner';

export default function Relatorios({ modoEmbutido }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [relatorios, setRelatorios] = useState([]);
  const [form, setForm] = useState({ titulo: '', url: '', categoria: 'Relatórios' });

  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const buscarRelatorios = async () => {
    try {
      const response = await fetch(`${baseURL}/relatorios`, { headers: authHeaders });
      if (response.ok) setRelatorios(await response.json());
    } catch (error) { toast.error("Erro de conexão."); }
  };

  useEffect(() => {
    if (!token) navigate('/');
    buscarRelatorios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm("Confirmar adição deste relatório?")) return;

    try {
      const response = await fetch(`${baseURL}/relatorios`, {
        method: 'POST', headers: authHeaders, body: JSON.stringify(form),
      });

      if (response.ok) {
        setForm({ titulo: '', url: '', categoria: 'Relatórios' });
        buscarRelatorios();
        toast.success("Relatório adicionado!");
      } else {
        toast.error('Erro ao criar relatório');
      }
    } catch (error) { toast.error('Erro de conexão'); }
  };

  const handleDelete = async (id, titulo) => {
    if (!window.confirm(`Excluir "${titulo}"?`)) return;
    try {
      const response = await fetch(`${baseURL}/relatorios/${id}`, { method: 'DELETE', headers: authHeaders });
      if (response.ok) {
          buscarRelatorios();
          toast.success("Relatório removido.");
      } else {
          toast.error("Erro ao deletar");
      }
    } catch (error) { toast.error("Erro de conexão"); }
  };

  return (
    <div className={modoEmbutido ? "" : "min-h-screen bg-gray-50 p-8 font-sans text-gray-800"}>
      {!modoEmbutido && (
        <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"><ArrowLeft size={20} className="text-gray-600" /></button>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FileText className="text-brand-blue" />Gestão de Relatórios</h1>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${!modoEmbutido ? 'max-w-4xl mx-auto' : ''}`}>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-600"><PlusCircle size={20} />Novo Relatório</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Título</label><input required className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Ex: Comercial" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Link Power BI</label><input required className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="https://..." value={form.url} onChange={e => setForm({...form, url: e.target.value})} /></div>
            <button type="submit" className="w-full bg-purple-600 text-white font-bold py-2 rounded hover:bg-purple-700 transition">Adicionar</button>
          </form>
        </div>

        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="p-4 text-xs font-bold text-gray-500">Título</th><th className="p-4 text-xs font-bold text-gray-500">Link</th><th className="p-4 text-xs font-bold text-gray-500 text-right">Ações</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {relatorios.map((rel) => (
                <tr key={rel.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-700 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div>{rel.titulo}</td><td className="p-4 text-gray-500 text-xs truncate max-w-[200px]">{rel.url}</td>
                  <td className="p-4 text-right"><button onClick={() => handleDelete(rel.id, rel.titulo)} className="text-gray-400 hover:text-red-500 transition p-2 rounded-full"><Trash2 size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}