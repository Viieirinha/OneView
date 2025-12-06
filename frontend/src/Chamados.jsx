import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, PlusCircle, FileText, User, ArrowRight, AlertTriangle, Paperclip, Eye, Download, X, Star } from 'lucide-react';
import { baseURL } from './api';
import { toast } from 'sonner';

export default function Chamados() {
  const token = localStorage.getItem('token');
  const cargoUsuario = localStorage.getItem('cargoUsuario');
  const isAdmin = cargoUsuario === 'admin';

  const [chamados, setChamados] = useState([]);
  const [relatorios, setRelatorios] = useState([]);
  const [form, setForm] = useState({ titulo: '', descricao: '', relatorio_id: '', anexo: null });
  
  // MODAIS
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', action: null });
  const [detalhesModal, setDetalhesModal] = useState({ show: false, chamado: null });
  const [resolucaoModal, setResolucaoModal] = useState({ show: false, id: null });
  const [textoResolucao, setTextoResolucao] = useState('');

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 2000000) { toast.error("O ficheiro é muito grande! Máximo 2MB."); return; }
        const reader = new FileReader();
        reader.onloadend = () => { setForm({ ...form, anexo: { nome: file.name, base64: reader.result } }); };
        reader.readAsDataURL(file);
    }
  };

  // Funções Auxiliares
  const pedirConfirmacao = (titulo, mensagem, acao) => setConfirmModal({ show: true, title: titulo, message: mensagem, action: () => acao() });
  const executarAcao = () => { if (confirmModal.action) confirmModal.action(); setConfirmModal({ ...confirmModal, show: false }); };
  const getNomeRelatorio = (id) => { const r = relatorios.find(x => x.id === id); return r ? r.titulo : "Geral"; };
  
  const abrirDetalhes = (chamado) => {
    setDetalhesModal({ show: true, chamado });
  };

  const criarChamado = (e) => {
    e.preventDefault();
    pedirConfirmacao("Enviar Ticket", "Tem a certeza que deseja abrir este chamado?", async () => {
        const payload = { 
            titulo: form.titulo, descricao: form.descricao,
            relatorio_id: form.relatorio_id ? parseInt(form.relatorio_id) : null,
            nome_anexo: form.anexo?.nome || null, anexo_base64: form.anexo?.base64 || null
        };
        try {
            const response = await fetch(`${baseURL}/chamados`, { method: 'POST', headers: authHeaders, body: JSON.stringify(payload) });
            if (response.ok) {
                setForm({ titulo: '', descricao: '', relatorio_id: '', anexo: null });
                carregarDados();
                toast.success("Ticket enviado com sucesso! 🎫");
            } else { toast.error("Erro ao enviar ticket."); }
        } catch(e) { toast.error("Erro de conexão."); }
    });
  };

  const abrirModalResolucao = (id) => {
    setResolucaoModal({ show: true, id });
    setTextoResolucao('');
  };

  const confirmarResolucao = async () => {
    if (!textoResolucao.trim()) { toast.error("Por favor, escreva um feedback."); return; }
    try {
        const response = await fetch(`${baseURL}/chamados/${resolucaoModal.id}/resolver`, {
            method: 'PUT', headers: authHeaders, body: JSON.stringify({ feedback: textoResolucao })
        });
        if (response.ok) {
            carregarDados(); toast.success("Resolvido!"); setResolucaoModal({ show: false, id: null }); setDetalhesModal({ show: false, chamado: null });
        }
    } catch(e) { toast.error("Erro."); }
  };

  const resolverChamado = (id) => {
     abrirModalResolucao(id);
  };

  const atribuirAMim = (id) => {
    pedirConfirmacao("Assumir Chamado", "Deseja atribuir a si mesmo?", async () => {
        const response = await fetch(`${baseURL}/chamados/${id}/atribuir`, { method: 'PUT', headers: authHeaders });
        if (response.ok) { carregarDados(); toast.success("Chamado atribuído!"); setDetalhesModal({ show: false, chamado: null }); }
    });
  };

  // --- FUNÇÃO DE AVALIAÇÃO ---
  const avaliarChamado = async (id, nota) => {
    try {
        const response = await fetch(`${baseURL}/chamados/${id}/avaliar`, {
            method: 'PUT', headers: authHeaders, body: JSON.stringify({ nota })
        });
        if (response.ok) {
            carregarDados();
            toast.success("Obrigado pela avaliação! ⭐");
            
            // ATUALIZAÇÃO VISUAL IMEDIATA NO MODAL (Para pintar as estrelas na hora)
            if (detalhesModal.show && detalhesModal.chamado && detalhesModal.chamado.id === id) {
                setDetalhesModal(prev => ({
                    ...prev,
                    chamado: { ...prev.chamado, avaliacao: nota }
                }));
            }
        } else {
            toast.error("Erro ao avaliar.");
        }
    } catch(e) { toast.error("Erro de conexão."); }
  };

  // --- COMPONENTE DE ESTRELAS ---
  const renderEstrelas = (chamado) => {
    const nota = chamado.avaliacao || 0;
    const jaAvaliou = nota > 0;
    
    // Admin nunca avalia. Utilizador avalia se ainda não o fez.
    const podeAvaliar = !isAdmin && !jaAvaliou;
    
    // Texto explicativo
    let label = "Avaliar:";
    if (jaAvaliou) label = "Avaliação:";
    if (isAdmin && !jaAvaliou) label = "Aguardando avaliação do utilizador";

    return (
        <div className="flex items-center gap-1 mt-2">
            <span className="text-xs font-bold text-gray-500 mr-1">
                {label}
            </span>
            
            {/* Se for Admin e não tiver avaliação, não mostra estrelas vazias para não confundir */}
            {(!isAdmin || jaAvaliou) && [1, 2, 3, 4, 5].map((star) => (
                <Star 
                   key={star} 
                   size={18} 
                   // Se a estrela for menor ou igual à nota, pinta de amarelo
                   className={`transition-colors ${star <= nota ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                   ${podeAvaliar ? "cursor-pointer hover:scale-125 hover:text-yellow-400" : "cursor-default"}`}
                   
                   // Só permite clicar se pode avaliar
                   onClick={(e) => {
                       e.stopPropagation();
                       if (podeAvaliar) avaliarChamado(chamado.id, star);
                   }}
                />
            ))}
        </div>
    );
  };

  return (
    <div className="animate-fadeIn relative">
        {isAdmin ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><MessageSquare className="text-brand-blue" /> Fila de Atendimento</h2>
                <div className="space-y-4">
                    {chamados.filter(c => c.status !== 'resolvido').length === 0 && <p className="text-gray-400 text-center py-8">Tudo limpo! 🏖️</p>}
                    {chamados.map(c => (
                    <div key={c.id} onClick={() => abrirDetalhes(c)} className={`cursor-pointer border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-white hover:bg-blue-50 transition ${c.status === 'resolvido' ? 'opacity-80 bg-gray-50' : ''}`}>
                        <div className="mb-2 md:mb-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">{c.codigo}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${c.status === 'aberto' ? 'bg-red-100 text-red-700' : c.status === 'em_andamento' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{c.status.replace('_', ' ')}</span>
                                {c.nome_anexo && <Paperclip size={14} className="text-gray-400" />}
                            </div>
                            <h4 className="font-bold text-gray-800">{c.titulo}</h4>
                            <p className="text-xs text-gray-500 mt-1">Autor: {c.autor_email}</p>
                            {/* Admin vê as estrelas se já tiver avaliação */}
                            {c.avaliacao && renderEstrelas(c)}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400"><Eye size={20} /></div>
                    </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><PlusCircle size={20} className="text-green-600" /> Abrir Novo Chamado</h3>
                    <form onSubmit={criarChamado} className="space-y-4">
                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Relatório</label><select className="w-full border rounded p-2 text-sm bg-white" value={form.relatorio_id} onChange={e => setForm({...form, relatorio_id: e.target.value})}><option value="">-- Geral --</option>{relatorios.map(rel => <option key={rel.id} value={rel.id}>{rel.titulo}</option>)}</select></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Assunto</label><input required className="w-full border rounded p-2 text-sm" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Descrição</label><textarea required rows="4" className="w-full border rounded p-2 text-sm" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} /></div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Anexo</label>
                            <div className="flex items-center gap-2">
                                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded text-sm flex items-center gap-2 transition w-full border border-dashed justify-center"><Paperclip size={16} /> {form.anexo ? form.anexo.nome : "Escolher ficheiro..."}<input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} /></label>
                                {form.anexo && <button type="button" onClick={() => setForm({...form, anexo: null})} className="text-red-500 hover:bg-red-50 p-2 rounded"><X size={16}/></button>}
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-brand-blue text-white font-bold py-2 rounded text-sm hover:bg-blue-700">Enviar Ticket</button>
                    </form>
                </div>
                <div className="md:col-span-2 space-y-4">
                    <h3 className="font-bold text-gray-700 text-lg mb-2">Meus Chamados</h3>
                    {chamados.map(c => (
                        <div key={c.id} onClick={() => abrirDetalhes(c)} className="bg-white border rounded-lg p-4 shadow-sm cursor-pointer hover:bg-blue-50 transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-xs bg-gray-100 px-2 rounded">{c.codigo}</span>
                                        {c.nome_anexo && <Paperclip size={14} className="text-gray-400" />}
                                    </div>
                                    <h4 className="font-bold text-brand-blue">{c.titulo}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{c.descricao}</p>
                                    
                                    {c.resolucao && (
                                        <div className="mt-3 bg-green-50 border border-green-200 p-2 rounded text-xs text-green-800 truncate max-w-md">
                                            <strong>Resolvido:</strong> {c.resolucao}
                                        </div>
                                    )}
                                    
                                    {/* MOSTRAR ESTRELAS SE ESTIVER RESOLVIDO */}
                                    {c.status === 'resolvido' && renderEstrelas(c)}

                                    {!c.resolucao && <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase mt-2 inline-block ${c.status === 'resolvido' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status.replace('_', ' ')}</span>}
                                </div>
                                {c.status === 'resolvido' && <CheckCircle className="text-green-500" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- MODAL DE DETALHES --- */}
        {detalhesModal.show && detalhesModal.chamado && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 animate-scaleIn relative max-h-[90vh] overflow-y-auto">
                    <button onClick={() => setDetalhesModal({ show: false, chamado: null })} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24}/></button>
                    
                    <div className="flex items-center gap-3 mb-6 border-b pb-4">
                        <div className="w-12 h-12 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center font-bold text-lg">{detalhesModal.chamado.codigo ? detalhesModal.chamado.codigo.replace('t_', '') : '#'}</div>
                        <div><h2 className="text-xl font-bold text-gray-800">{detalhesModal.chamado.titulo}</h2><p className="text-sm text-gray-500">Aberto por: {detalhesModal.chamado.autor_email}</p></div>
                    </div>

                    <div className="space-y-6">
                        <div><h4 className="text-sm font-bold text-gray-500 uppercase mb-1">Descrição</h4><p className="text-gray-700 bg-gray-50 p-4 rounded-lg border">{detalhesModal.chamado.descricao}</p></div>
                        
                        {detalhesModal.chamado.resolucao && (
                            <div>
                                <h4 className="text-sm font-bold text-green-600 uppercase mb-1">Resolução</h4>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <p className="text-gray-700 mb-2">{detalhesModal.chamado.resolucao}</p>
                                    {/* Estrelas também aparecem no modal */}
                                    {renderEstrelas(detalhesModal.chamado)}
                                </div>
                            </div>
                        )}
                        
                        {detalhesModal.chamado.anexo_base64 && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Anexo do Utilizador</h4>
                                <div className="flex gap-2">
                                    <a href={detalhesModal.chamado.anexo_base64} download={detalhesModal.chamado.nome_anexo} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded transition border"><Download size={16} /> Descarregar</a>
                                    {detalhesModal.chamado.nome_anexo.match(/\.(jpeg|jpg|png|gif)$/i) && (
                                        <button onClick={() => { const w = window.open(); w.document.write(`<img src="${detalhesModal.chamado.anexo_base64}" style="max-width:100%">`); }} className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded transition border border-blue-200"><Eye size={16} /> Ver Imagem</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {isAdmin && (
                        <div className="mt-8 pt-6 border-t flex justify-end gap-3">
                            {detalhesModal.chamado.status === 'aberto' && <button onClick={() => atribuirAMim(detalhesModal.chamado.id)} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition">Atribuir a Mim</button>}
                            {detalhesModal.chamado.status !== 'resolvido' && <button onClick={() => abrirModalResolucao(detalhesModal.chamado.id)} className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 transition">Marcar Resolvido</button>}
                        </div>
                    )}
                </div>
            </div>
        )}

        {resolucaoModal.show && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4 animate-fadeIn">
                <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 animate-scaleIn">
                    <div className="flex items-center gap-3 text-green-600 mb-4"><CheckCircle size={28} /><h3 className="text-lg font-bold text-gray-800">Finalizar Chamado</h3></div>
                    <p className="text-gray-600 mb-4">Feedback da resolução:</p>
                    <textarea autoFocus className="w-full border rounded-lg p-3 text-sm h-32 focus:ring-2 focus:ring-green-500 outline-none mb-4" placeholder="Ex: Corrigido..." value={textoResolucao} onChange={(e) => setTextoResolucao(e.target.value)} />
                    <div className="flex justify-end gap-3"><button onClick={() => setResolucaoModal({ show: false, id: null })} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium transition">Cancelar</button><button onClick={confirmarResolucao} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold transition shadow-sm">Confirmar e Fechar</button></div>
                </div>
            </div>
        )}

        {confirmModal.show && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 animate-fadeIn">
                <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-scaleIn">
                    <div className="flex items-center gap-3 text-brand-orange mb-4"><AlertTriangle size={28} /><h3 className="text-lg font-bold text-gray-800">{confirmModal.title}</h3></div>
                    <p className="text-gray-600 mb-6">{confirmModal.message}</p>
                    <div className="flex justify-end gap-3"><button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium transition">Cancelar</button><button onClick={executarAcao} className="px-4 py-2 bg-brand-blue text-white rounded hover:bg-blue-700 font-bold transition shadow-sm">Confirmar</button></div>
                </div>
            </div>
        )}
    </div>
  );
}