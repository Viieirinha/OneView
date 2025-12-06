import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, PlusCircle, FileText, User, ArrowRight } from 'lucide-react';
import { baseURL } from './api';
import { toast } from 'sonner';

export default function Chamados() {
  const token = localStorage.getItem('token');
  const cargoUsuario = localStorage.getItem('cargoUsuario');
  const isAdmin = cargoUsuario === 'admin';

  const [chamados, setChamados] = useState([]);
  const [relatorios, setRelatorios] = useState([]);
  const [form, setForm] = useState({ titulo: '', descricao: '', relatorio_id: '' });
  
  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    try {
        const resChamados = await fetch(`${baseURL}/chamados`, { headers: authHeaders });
        if (resChamados.ok) setChamados(await resChamados.json());
        const resRelatorios = await fetch(`${baseURL}/relatorios`, { headers: authHeaders });
        if (resRelatorios.ok) setRelatorios(await resRelatorios.json());
    } catch(e) { console.error(e); }
  };

  const criarChamado = async (e) => {
    e.preventDefault();
    
    // Confirmação antes de adicionar
    if (!window.confirm("Deseja enviar este ticket de suporte?")) return;

    const payload = { ...form, relatorio_id: form.relatorio_id ? parseInt(form.relatorio_id) : null };
    try {
        const response = await fetch(`${baseURL}/chamados`, { method: 'POST', headers: authHeaders, body: JSON.stringify(payload) });
        if (response.ok) {
            setForm({ titulo: '', descricao: '', relatorio_id: '' });
            carregarDados();
            toast.success("Ticket enviado com sucesso! 🎫");
        } else { toast.error("Erro ao enviar ticket."); }
    } catch(e) { toast.error("Erro de conexão."); }
  };

  const resolverChamado = async (id) => {
    if (!window.confirm("Tem certeza que deseja marcar como resolvido?")) return;
    const response = await fetch(`${baseURL}/chamados/${id}/resolver`, { method: 'PUT', headers: authHeaders });
    if (response.ok) { carregarDados(); toast.success("Chamado finalizado!"); }
  };

  const atribuirAMim = async (id) => {
    if (!window.confirm("Deseja assumir este chamado?")) return;
    const response = await fetch(`${baseURL}/chamados/${id}/atribuir`, { method: 'PUT', headers: authHeaders });
    if (response.ok) { carregarDados(); toast.success("Chamado atribuído a você!"); }
  };

  const getNomeRelatorio = (id) => {
    if (!id) return "Geral";
    const rel = relatorios.find(r => r.id === id);
    return rel ? rel.titulo : "Relatório Excluído";
  };

  return (
    <div className="animate-fadeIn">
        {isAdmin ? (
            // --- VISÃO DO ADMIN ---
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><MessageSquare className="text-brand-blue" /> Fila de Atendimento</h2>
                <div className="space-y-4">
                    {chamados.filter(c => c.status !== 'resolvido').length === 0 && <p className="text-gray-400 text-center py-8">Tudo limpo! 🏖️</p>}
                    {chamados.map(c => (
                    <div key={c.id} className={`border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-white hover:shadow-md transition ${c.status === 'resolvido' ? 'opacity-60 bg-gray-50' : ''}`}>
                        <div className="mb-4 md:mb-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${c.status === 'aberto' ? 'bg-red-100 text-red-700' : c.status === 'em_andamento' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{c.status.replace('_', ' ')}</span>
                            {c.relatorio_id && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium"><FileText size={12} className="inline mr-1"/>{getNomeRelatorio(c.relatorio_id)}</span>}
                            <span className="text-xs text-gray-500">{c.autor_email}</span>
                        </div>
                        <h4 className="font-bold text-lg text-gray-800">{c.titulo}</h4>
                        <p className="text-gray-600 mt-1">{c.descricao}</p>
                        {c.tecnico && <p className="text-xs text-blue-600 mt-2 font-bold flex items-center gap-1"><User size={12}/> {c.tecnico}</p>}
                        </div>
                        <div className="flex gap-2">
                        {c.status === 'aberto' && <button onClick={() => atribuirAMim(c.id)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700 transition">Atribuir <ArrowRight size={16} /></button>}
                        {c.status !== 'resolvido' && <button onClick={() => resolverChamado(c.id)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-700 transition"><CheckCircle size={16} /> Finalizar</button>}
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        ) : (
            // --- VISÃO DO USUÁRIO ---
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><PlusCircle size={20} className="text-green-600" /> Abrir Novo Chamado</h3>
                    <form onSubmit={criarChamado} className="space-y-4">
                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Relatório</label><select className="w-full border rounded p-2 text-sm bg-white" value={form.relatorio_id} onChange={e => setForm({...form, relatorio_id: e.target.value})}><option value="">-- Geral --</option>{relatorios.map(rel => <option key={rel.id} value={rel.id}>{rel.titulo}</option>)}</select></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Assunto</label><input required className="w-full border rounded p-2 text-sm" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Descrição</label><textarea required rows="4" className="w-full border rounded p-2 text-sm" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} /></div>
                        <button type="submit" className="w-full bg-brand-blue text-white font-bold py-2 rounded text-sm hover:bg-blue-700">Enviar Ticket</button>
                    </form>
                </div>
                <div className="md:col-span-2 space-y-4">
                    <h3 className="font-bold text-gray-700 text-lg mb-2">Meus Chamados</h3>
                    {chamados.map(c => (
                        <div key={c.id} className="bg-white border rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div><h4 className="font-bold text-brand-blue">{c.titulo}</h4><p className="text-sm text-gray-600 mt-1">{c.descricao}</p><div className="flex gap-2 mt-2"><span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${c.status === 'resolvido' ? 'bg-green-100 text-green-700' : c.status === 'em_andamento' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status.replace('_', ' ')}</span></div></div>
                                {c.status === 'resolvido' && <CheckCircle className="text-green-500" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}