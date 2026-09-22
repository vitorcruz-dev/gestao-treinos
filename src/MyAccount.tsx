import React, { useState } from 'react';
import { supabase } from './supabase';

export default function MyAccount() {
  // Vai buscar os dados do utilizador atualmente logado
  const currentUser = JSON.parse(localStorage.getItem('scoutpro_user') || '{}');
  const [loading, setLoading] = useState(false);

  // Modal elegante para sucesso/erro
  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onClose?: () => void;
  }>({ show: false, title: '', message: '' });

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const payload = {
      name: fd.get('name') as string,
      username: fd.get('username') as string,
      password: fd.get('password') as string,
      phone: fd.get('phone') as string,
      address: fd.get('address') as string,
      age: Number(fd.get('age')) || null,
    };

    try {
      // 1. Atualiza na Base de Dados
      const { error } = await supabase.from('staff').update(payload).eq('id', currentUser.id);
      if (error) throw error;

      // 2. Atualiza a "memória" do navegador para a app assumir logo o novo nome/password
      const updatedUser = { ...currentUser, ...payload };
      localStorage.setItem('scoutpro_user', JSON.stringify(updatedUser));

      // 3. Mostra popup de sucesso e recarrega
      setModal({
        show: true,
        title: 'Sucesso',
        message: 'A sua conta foi atualizada com sucesso!',
        onClose: () => window.location.reload()
      });

    } catch (err: any) {
      setModal({ show: true, title: 'Erro', message: `Não foi possível atualizar: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const renderModal = () => {
    if (!modal.show) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1121]/80 backdrop-blur-sm p-4">
        <div className="bg-[#151c2c] border border-slate-700/50 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
          <h3 className="text-lg font-bold text-white mb-2">{modal.title}</h3>
          <p className="text-sm font-medium text-slate-400 mb-8">{modal.message}</p>
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (modal.onClose) modal.onClose();
                else setModal(prev => ({ ...prev, show: false }));
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-2 md:p-6 max-w-3xl mx-auto">
      {renderModal()}
      
      <div className="bg-[#151c2c] p-6 md:p-8 rounded-2xl border border-slate-800/60 shadow-lg">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/60">
          <h2 className="text-xl font-semibold text-white">A Minha Conta</h2>
          <span className="bg-blue-600/20 text-blue-400 border border-blue-600/30 text-[10px] font-bold uppercase px-3 py-1.5 rounded-md tracking-wider">
            {currentUser.role}
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-800/80">
            <h3 className="text-blue-400 font-bold mb-4 uppercase text-[10px] tracking-widest">Credenciais de Acesso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email de Acesso *</label>
                <input required type="email" name="username" defaultValue={currentUser.username} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Palavra-Passe *</label>
                <input required type="text" name="password" defaultValue={currentUser.password} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-800/80">
            <h3 className="text-blue-400 font-bold mb-4 uppercase text-[10px] tracking-widest">Informações Pessoais</h3>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nome Completo *</label>
                <input required type="text" name="name" defaultValue={currentUser.name} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
              <div className="col-span-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Telemóvel</label>
                <input type="text" name="phone" defaultValue={currentUser.phone} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div className="col-span-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Idade</label>
                <input type="number" name="age" defaultValue={currentUser.age} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div className="col-span-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Morada</label>
                <input type="text" name="address" defaultValue={currentUser.address} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-lg shadow-md transition-colors text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'A guardar...' : 'Guardar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}