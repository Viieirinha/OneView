import React, { useState, useEffect } from 'react';
import { Trash2, UserPlus, ArrowLeft, Users as UsersIcon, Pencil, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { baseURL } from './api';
import { toast } from 'sonner';

export default function GestaoUsuarios({ modoEmbutido }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [usuarios, setUsuarios] = useState([]);
  const [idEdicao, setIdEdicao] = useState(null);
  const [form, setForm] = useState({ nome: '', email: '', password: '', cargo: 'visitante' });

  const cargosDisponiveis = ['admin', 'comercial', 'financeiro', 'operacional', 'diretoria', 'visitante'];
  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const buscarUsuarios = async () => {
    try {
      const response = await fetch(`${baseURL}/usuarios`, { headers: authHeaders });
      if (response.ok) setUsuarios(await response.json());
    } catch (error) {
      toast.error("Erro de conexão ao carregar usuários.");
    }
  };

  useEffect(() => {
    if (!token) navigate('/');
    buscarUsuarios();
  }, []);

  const iniciarEdicao = (usuario) => {
    setIdEdicao(usuario.id);
    setForm({ nome: usuario.nome, email: usuario.email, password: '', cargo: usuario.cargo || 'visitante' });
  };

  const cancelarEdicao = () => {
    setIdEdicao(null);
    setForm({ nome: '', email: '', password: '', cargo: 'visitante' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // CONFIRMAÇÃO
    const acao = idEdicao ? "atualizar este usuário" : "criar este novo usuário";
    if (!window.confirm(`Tem certeza que deseja ${acao}?`)) return;

    const url = idEdicao ? `${baseURL}/usuarios/${idEdicao}` : `${baseURL}/usuarios`;
    const method = idEdicao ? 'PUT' : 'POST';
    const dadosEnvio = { ...form };
    if (idEdicao && !dadosEnvio.password) delete dadosEnvio.password;

    try {
      const response = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(dadosEnvio) });
      
      if (response.ok) { 
        cancelarEdicao(); 
        buscarUsuarios(); 
        toast.success(idEdicao ? "Utilizador atualizado com sucesso!" : "Utilizador criado com sucesso!");
      } else { 
        const data = await response.json(); 
        toast.error(data.detail || 'Erro ao guardar utilizador');
      }
    } catch (error) {
      toast.error('Erro de conexão com o servidor');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem a certeza que deseja excluir este utilizador?")) {
      try {
        const response = await fetch(`${baseURL}/usuarios/${id}`, { method: 'DELETE', headers: authHeaders });
        if (response.ok) {
            buscarUsuarios();
            toast.success("Utilizador removido.");
        } else {
            toast.error("Não foi possível remover o utilizador.");
        }
      } catch (error) {
        toast.error("Erro de conexão.");
      }
    }
  };

  return (
    <div className={modoEmbutido ? "" : "min-h-screen bg-gray-50 p-8 font-sans text-gray-800"}>
      {!modoEmbutido && (
        <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"><ArrowLeft size={20} className="text-gray-600" /></button>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><UsersIcon className="text-brand-blue" />Gestão de Utilizadores</h1>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${!modoEmbutido ? 'max-w-4xl mx-auto' : ''}`}>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-brand-orange">
            {idEdicao ? <Pencil size={20} /> : <UserPlus size={20} />} {idEdicao ? 'Editar' : 'Novo Utilizador'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="text-sm text-gray-600">Nome</label><input required className="w-full border rounded p-2 text-sm" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Ex: João Silva" /></div>
            <div><label className="text-sm text-gray-600">Email</label><input required className="w-full border rounded p-2 text-sm" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="joao@oneview.com" /></div>
            <div>
              <label className="text-sm text-gray-600">Cargo / Função</label>
              <select className="w-full border rounded p-2 bg-white text-sm" value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})}>
                {cargosDisponiveis.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>
            <div><label className="text-sm text-gray-600">{idEdicao ? 'Nova Palavra-passe (Opcional)' : 'Palavra-passe Temporária'}</label><input className="w-full border rounded p-2 text-sm" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required={!idEdicao} placeholder="••••••" /></div>
            
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-brand-blue text-white py-2 rounded font-bold hover:bg-blue-800 transition">Guardar</button>
              {idEdicao && <button type="button" onClick={cancelarEdicao} className="px-3 bg-gray-200 rounded hover:bg-gray-300">X</button>}
            </div>
          </form>
        </div>

        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b"><tr><th className="p-4 text-xs font-bold text-gray-500">Nome / Email</th><th className="p-4 text-xs font-bold text-gray-500">Cargo</th><th className="p-4 text-xs font-bold text-gray-500 text-right">Ações</th></tr></thead>
            <tbody className="divide-y">
              {usuarios.map(u => (
                <tr key={u.id} className={`hover:bg-gray-50 transition ${idEdicao === u.id ? 'bg-blue-50' : ''}`}>
                  <td className="p-4">
                    <div className="font-medium text-gray-700">{u.nome}</div>
                    <div className="text-xs text-gray-400">{u.email}</div>
                  </td>
                  <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${u.cargo === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{u.cargo}</span></td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => iniciarEdicao(u)} className="text-gray-400 hover:text-blue-500 p-1 transition"><Pencil size={18} /></button>
                      <button onClick={() => handleDelete(u.id)} className="text-gray-400 hover:text-red-500 p-1 transition"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}