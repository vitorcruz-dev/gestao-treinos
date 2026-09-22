import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

interface StaffMemberExtended {
  id: string;
  name: string;
  role: string;
  username: string;
  password?: string;
  phone?: string;
  address?: string;
  age?: number;
}

export default function AdminModule() {
  const [staffList, setStaffList] = useState<StaffMemberExtended[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [current, setCurrent] = useState<StaffMemberExtended | null>(null);
  const [loading, setLoading] = useState(true);

  // ESTADO DO MODAL PERSONALIZADO
  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
    type: 'alert' | 'confirm';
  }>({ show: false, title: '', message: '', onConfirm: null, type: 'alert' });

  // Vai buscar o staff ativo (para saber quem não se pode auto-eliminar)
  const currentUser = JSON.parse(localStorage.getItem('scoutpro_user') || '{}');

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('role')
        .order('name');
      
      if (error) throw error;
      if (data) setStaffList(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Controladores do Modal
  const openAlert = (title: string, message: string) => {
    setModal({ show: true, title, message, onConfirm: null, type: 'alert' });
  };

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModal({ show: true, title, message, onConfirm, type: 'confirm' });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, show: false }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    const payload = {
      name: fd.get('name') as string,
      role: fd.get('role') as string,
      username: fd.get('username') as string,
      password: fd.get('password') as string,
      phone: fd.get('phone') as string,
      address: fd.get('address') as string,
      age: Number(fd.get('age')) || null,
    };

    try {
      if (current?.id) {
        const { error } = await supabase.from('staff').update(payload).eq('id', current.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('staff').insert([payload]);
        if (error) throw error;
      }
      
      window.location.reload();
    } catch (err: any) {
      openAlert("Erro", `Erro ao guardar: ${err.message}`);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (id === currentUser.id) {
      openAlert("Ação não permitida", "Não pode eliminar a sua própria conta de administrador!");
      return;
    }
    
    openConfirm(
      "Eliminar Acesso",
      `Tem a certeza que deseja eliminar o acesso de ${name}? Esta ação não pode ser revertida.`,
      async () => {
        try {
          const { error } = await supabase.from('staff').delete().eq('id', id);
          if (error) throw error;
          window.location.reload();
        } catch (err: any) {
          openAlert("Erro", `Erro ao eliminar: ${err.message}`);
        }
      }
    );
  };

  const openForm = (staff: StaffMemberExtended | null = null) => {
    setCurrent(staff);
    setView('form');
  };

  // COMPONENTE DO MODAL
  const renderModal = () => {
    if (!modal.show) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
          <h3 className="text-xl font-black text-white mb-2">{modal.title}</h3>
          <p className="text-slate-300 mb-8">{modal.message}</p>

          <div className="flex gap-3 justify-end">
            {modal.type === 'confirm' && (
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl font-bold text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors">
                Cancelar
              </button>
            )}
            <button 
              onClick={() => {
                if (modal.onConfirm) modal.onConfirm();
                else closeModal();
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-white transition-colors ${
                modal.type === 'confirm' ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {modal.type === 'confirm' ? 'Eliminar' : 'OK'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // VISTA EM LISTA (STAFF)
  if (view === 'list') {
    return (
      <div className="p-2 md:p-6 max-w-7xl mx-auto relative">
        
        {/* Renderiza o Popup Customizado */}
        {renderModal()}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white">Equipa Técnica</h2>
            <p className="text-slate-400">Gira as credenciais, dados e permissões do seu staff.</p>
          </div>
          <button onClick={() => openForm()} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 shadow-md transition-colors flex gap-2 items-center">
            <span>+</span> Novo Membro
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400">A carregar acessos...</p>
        ) : staffList.length === 0 ? (
          <div className="bg-slate-800 p-10 rounded-2xl border border-slate-700 text-center">
            <h3 className="text-white font-bold text-lg">Sem Staff</h3>
            <p className="text-slate-400 mt-2">Adicione membros para lhes dar acesso à plataforma.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {staffList.map(member => (
              <div key={member.id} className={`bg-slate-800 p-4 rounded-2xl border ${member.id === currentUser.id ? 'border-blue-500/50 shadow-blue-900/20' : 'border-slate-700'} flex flex-col md:flex-row items-center gap-4 hover:border-slate-500 transition-colors relative shadow-sm`}>
                
                {/* Avatar */}
                <div className="w-12 h-12 shrink-0 rounded-full bg-slate-700 flex items-center justify-center text-lg font-black text-white shadow-inner relative">
                  {member.name.substring(0, 2).toUpperCase()}
                </div>
                
                {/* Nome e Cargo */}
                <div className="flex-1 min-w-0 text-center md:text-left w-full">
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                    <h3 className="text-lg font-black text-white leading-tight truncate" title={member.name}>{member.name}</h3>
                    {member.id === currentUser.id && (
                      <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block self-center">Você</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wide truncate block mt-1" title={member.role}>{member.role}</span>
                </div>
                
                {/* Contactos */}
                <div className="flex flex-col text-sm text-slate-400 w-full md:w-auto text-center md:text-left shrink-0 bg-slate-900/50 md:bg-transparent p-3 md:p-0 rounded-xl border border-slate-700 md:border-none">
                  <span className="truncate" title={member.username}>📧 {member.username}</span>
                  <span className="truncate mt-1" title={member.phone || 'Sem contacto'}>📱 {member.phone || 'Sem contacto'}</span>
                </div>

                {/* Ações */}
                <div className="flex gap-2 w-full md:w-auto shrink-0 justify-center mt-2 md:mt-0">
                  <button onClick={() => openForm(member)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-colors">
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(member.id, member.name)} 
                    disabled={member.id === currentUser.id}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${member.id === currentUser.id ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed' : 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border-red-500/20'}`}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // VISTA 3: FORMULÁRIO (CRIAR / EDITAR)
  return (
    <div className="p-2 md:p-6 max-w-4xl mx-auto">
      <div className="bg-slate-800 p-6 md:p-10 rounded-3xl border border-slate-700 shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-white">{current ? 'Editar Membro' : 'Novo Membro da Equipa Técnica'}</h2>
          <button onClick={() => setView('list')} className="text-slate-400 hover:text-white font-bold">✕ Cancelar</button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-blue-400 font-bold mb-4 uppercase text-xs tracking-wider">Credenciais de Acesso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Email (Login) *</label>
                <input required type="email" name="username" defaultValue={current?.username} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Password *</label>
                <input required type="text" name="password" defaultValue={current?.password} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-blue-400 font-bold mb-4 uppercase text-xs tracking-wider">Perfil</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Nome Completo *</label>
                <input required type="text" name="name" defaultValue={current?.name} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Cargo *</label>
                <select required name="role" defaultValue={current?.role || 'Treinador Adjunto'} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Administrador</option>
                  <option>Treinador Principal</option>
                  <option>Treinador Adjunto</option>
                  <option>Treinador de Guarda-Redes</option>
                  <option>Preparador Físico</option>
                  <option>Observador / Scout</option>
                  <option>Fisioterapeuta</option>
                  <option>Diretor</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="col-span-1">
                <label className="block text-sm font-bold text-slate-300 mb-2">Telemóvel</label>
                <input type="text" name="phone" defaultValue={current?.phone} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: 912 345 678" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-bold text-slate-300 mb-2">Idade</label>
                <input type="number" name="age" defaultValue={current?.age} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-bold text-slate-300 mb-2">Morada</label>
                <input type="text" name="address" defaultValue={current?.address} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-colors text-lg mt-4">
            {current ? 'Atualizar Membro' : 'Criar Acesso'}
          </button>
        </form>
      </div>
    </div>
  );
}