import React from 'react';

export default function Login() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-lg border-t-4 border-brand-orange">
        
        {/* --- ÁREA DA LOGO --- */}
        <div className="flex justify-center">
             {/* COMENTÁRIO: Substitua o texto abaixo pela tag <img src="/logo.png" /> */}
            <h1 className="text-3xl font-bold text-brand-blue">SUA EMPRESA</h1>
        </div>

        <h2 className="text-center text-gray-500">Portal de Dashboards</h2>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring-2 focus:ring-brand-orange"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-2 font-bold text-white transition bg-brand-orange rounded hover:bg-orange-600"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}