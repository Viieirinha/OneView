// frontend/src/Usuarios.jsx
import React, { useState, useEffect } from 'react';
import { Trash2, UserPlus, ArrowLeft, Users as UsersIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Usuarios() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // Pega o token
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ nome: '', email: '', password: '' });
  const [erro, setErro] = useState('');

  // HEADER PADRÃO COM TOKEN
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const buscarUsuarios = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/usuarios', { headers: authHeaders });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      const response = await fetch('http://127.0.0.1:8000/usuarios', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setForm({ nome: '', email: '', password: '' });
        buscarUsuarios();
        alert("Usuário criado com sucesso!");
      } else {
        const errorData = await response.json();
        setErro(errorData.detail || 'Erro ao criar usuário');
      }
    } catch (error) {
      setErro('Erro de conexão');
    }
  };

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir ${nome}?`)) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/usuarios/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (response.ok) buscarUsuarios();
      else alert("Erro ao deletar");
    } catch (error) {
      alert("Erro de conexão");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"><ArrowLeft size={20} className="text-gray-600" /></button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><UsersIcon className="text-brand-blue" />Gestão de Usuários</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-brand-orange"><UserPlus size={20} />Novo Usuário</h2>
          {erro && <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded">{erro}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Nome Completo</label><input required type="text" className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none" placeholder="Ex: João Silva" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Email Corporativo</label><input required type="email" className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none" placeholder="joao@oneview.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Senha Temporária</label><input required type="password" className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none" placeholder="••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
            <button type="submit" className="w-full bg-brand-blue text-white font-bold py-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2">Cadastrar</button>
          </form>
        </div>
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="p-4 text-xs font-bold text-gray-500 uppercase">Nome</th><th className="p-4 text-xs font-bold text-gray-500 uppercase">Email</th><th className="p-4 text-xs font-bold text-gray-500 uppercase">Cargo</th><th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-700">{user.nome}</td><td className="p-4 text-gray-500 text-sm">{user.email}</td><td className="p-4"><span className={`text-xs px-2 py-1 rounded-full font-bold ${user.cargo === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>{user.cargo}</span></td>
                  <td className="p-4 text-right"><button onClick={() => handleDelete(user.id, user.nome)} className="text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-full"><Trash2 size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}