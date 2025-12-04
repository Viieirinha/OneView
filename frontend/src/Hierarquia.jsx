import React, { useState, useEffect } from 'react';
import { Shield, Save, Check, X } from 'lucide-react';
import { baseURL } from './api';

export default function Hierarquia() {
  const token = localStorage.getItem('token');
  const [relatorios, setRelatorios] = useState([]);
  const [permissoes, setPermissoes] = useState([]);
  const [cargoSelecionado, setCargoSelecionado] = useState('comercial');

  const cargosDisponiveis = ['admin', 'comercial', 'financeiro', 'operacional', 'diretoria'];

  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const resRel = await fetch(`${baseURL}/relatorios`, { headers: authHeaders });
    const resPerm = await fetch(`${baseURL}/permissoes`, { headers: authHeaders });
    setRelatorios(await resRel.json());
    setPermissoes(await resPerm.json());
  };

  const togglePermissao = async (relatorioId, temPermissao) => {
    if (temPermissao) {
      // Remover
      await fetch(`${baseURL}/permissoes/${cargoSelecionado}/${relatorioId}`, { method: 'DELETE', headers: authHeaders });
    } else {
      // Adicionar
      await fetch(`${baseURL}/permissoes`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ cargo: cargoSelecionado, relatorio_id: relatorioId })
      });
    }
    carregarDados(); // Recarrega para atualizar a tela
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="text-brand-blue" /> Gestão de Hierarquia
        </h2>
        
        {/* Seletor de Cargo */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Configurar Cargo:</span>
          <select 
            value={cargoSelecionado}
            onChange={(e) => setCargoSelecionado(e.target.value)}
            className="border rounded p-2 text-sm bg-gray-50 font-bold text-brand-blue outline-none focus:ring-2 focus:ring-brand-blue"
          >
            {cargosDisponiveis.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Selecione abaixo quais relatórios o cargo <strong>{cargoSelecionado.toUpperCase()}</strong> pode acessar.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatorios.map(rel => {
          const temPermissao = permissoes.some(p => p.cargo === cargoSelecionado && p.relatorio_id === rel.id);
          
          return (
            <div 
              key={rel.id} 
              onClick={() => togglePermissao(rel.id, temPermissao)}
              className={`cursor-pointer p-4 rounded-lg border-2 transition flex items-center justify-between ${temPermissao ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${temPermissao ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`font-medium ${temPermissao ? 'text-green-800' : 'text-gray-500'}`}>{rel.titulo}</span>
              </div>
              {temPermissao ? <Check size={20} className="text-green-600" /> : <X size={20} className="text-gray-300" />}
            </div>
          )
        })}
      </div>
      
      {cargoSelecionado === 'admin' && (
        <p className="mt-6 text-xs text-orange-500 bg-orange-50 p-2 rounded">
          * Nota: O Administrador sempre tem acesso a todos os relatórios, independente desta configuração.
        </p>
      )}
    </div>
  );
}