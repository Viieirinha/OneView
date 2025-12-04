// frontend/src/GestaoUsuarios.jsx
import React, { useState, useEffect } from 'react';
import { Trash2, UserPlus, ArrowLeft, Users as UsersIcon, Pencil, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { baseURL } from './api';

export default function GestaoUsuarios({ modoEmbutido }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [usuarios, setUsuarios] = useState([]);
  const [idEdicao, setIdEdicao] = useState(null);
  
  const [form, setForm] = useState({ nome: '', email: '', password: '', cargo: 'visitante' });
  const [erro, setErro] = useState('');

  const cargosDisponiveis = ['admin', 'comercial', 'financeiro', 'operacional', 'diretoria', 'visitante'];

  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const buscarUsuarios = async () => {
    try {
      const response = await fetch(`${baseURL}/usuarios`, { headers: authHeaders });
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Erro:", error);
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
    const url = idEdicao ? `${baseURL}/usuarios/${idEdicao}` : `${baseURL}/usuarios`;
    const method = idEdicao ? 'PUT' : 'POST';
    const dadosEnvio = { ...form };
    if (idEdicao && !dadosEnvio.password) delete dadosEnvio.password;

    const response = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(dadosEnvio) });
    if (response.ok) { cancelarEdicao(); buscarUsuarios(); alert("Salvo com sucesso!"); }
    else { const data = await response.json(); setErro(data.detail || 'Erro'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Excluir usuário?")) {
      await fetch(`${baseURL}/usuarios/${id}`, { method: 'DELETE', headers: authHeaders });
      buscarUsuarios();
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
              <UsersIcon className="text-brand-blue" />
              Gestão de Usuários
            </h1>
          </div>
        </div>
      )}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${!modoEmbutido ? 'max-w-4xl mx-auto' : ''}`}>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-brand-orange">
            {idEdicao ? <Pencil size={20} /> : <UserPlus size={20} />} 
            {idEdicao ? 'Editar' : 'Novo Usuário'}
          </h2>
          
          {erro && <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded">{erro}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nome Completo</label>
              <input required className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Ex: João Silva" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email Corporativo</label>
              <input required className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="joao@oneview.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Cargo / Função</label>
              <select className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-brand-blue outline-none" value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})}>
                {cargosDisponiveis.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">{idEdicao ? 'Nova Senha (Opcional)' : 'Senha Temporária'}</label>
              <input className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required={!idEdicao} placeholder="••••••" />
            </div>
            
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-brand-orange text-white font-bold py-2 rounded hover:bg-orange-600 transition flex items-center justify-center gap-2">Salvar</button>
              {idEdicao && <button type="button" onClick={cancelarEdicao} className="px-3 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"><X size={20} /></button>}
            </div>
          </form>
        </div>

        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="p-4 text-xs font-bold text-gray-500 uppercase">Nome / Email</th><th className="p-4 text-xs font-bold text-gray-500 uppercase">Cargo</th><th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map(u => (
                <tr key={u.id} className={`hover:bg-gray-50 transition ${idEdicao === u.id ? 'bg-blue-50' : ''}`}>
                  <td className="p-4">
                    <div className="font-medium text-gray-700">{u.nome}</div>
                    <div className="text-xs text-gray-400">{u.email}</div>
                  </td>
                  <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${u.cargo === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{u.cargo}</span></td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => iniciarEdicao(u)} className="text-gray-400 hover:text-blue-500 p-1 rounded-full hover:bg-blue-50 transition"><Pencil size={18} /></button>
                      <button onClick={() => handleDelete(u.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition"><Trash2 size={18} /></button>
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