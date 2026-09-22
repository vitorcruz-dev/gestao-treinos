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

  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
    type: 'alert' | 'confirm';
  }>({ show: false, title: '', message: '', onConfirm: null, type: 'alert' });

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

  const openAlert = (title: string, message: string) => setModal({ show: true, title, message, onConfirm: null, type: 'alert' });
  const openConfirm = (title: string, message: string, onConfirm: () => void) => setModal({ show: true, title, message, onConfirm, type: 'confirm' });
  const closeModal = () => setModal(prev => ({ ...prev, show: false }));

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    // Agora o payload aceita o campo de alteração obrigatória
    const payload: any = {
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
        // Se a password for alterada durante a edição, forçar alteração no login!
        if (payload.password !== current.password) {
          payload.must_change_password = true;
        }
        const { error } = await supabase.from('staff').update(payload).eq('id', current.id);
        if (error) throw error;
      } else {
        // Contas novas obrigam sempre à alteração da password no primeiro login
        payload.must_change_password = true;
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
      openAlert("Ação não permitida", "Não pode remover os seus próprios acessos de administrador.");
      return;
    }
    openConfirm("Remover Acesso", `Confirma a remoção do acesso de ${name}? Esta ação é irreversível.`, async () => {
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

  const renderModal = () => {
    if (!modal.show) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1121]/80 backdrop-blur-sm p-4">
        <div className="bg-[#151c2c] border border-slate-700/50 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
          <h3 className="text-lg font-bold text-white mb-2">{modal.title}</h3>
          <p className="text-sm font-medium text-slate-400 mb-8">{modal.message}</p>
          <div className="flex gap-3 justify-end">
            {modal.type === 'confirm' && (
              <button onClick={closeModal} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors">Cancelar</button>
            )}
            <button 
              onClick={() => { if (modal.onConfirm) modal.onConfirm(); else closeModal(); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${modal.type === 'confirm' ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}
            >
              {modal.type === 'confirm' ? 'Eliminar' : 'OK'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (view === 'list') {
    return (
      <div className="p-2 md:p-6 max-w-5xl mx-auto relative">
        {renderModal()}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">Equipa Técnica</h2>
            <p className="text-sm text-slate-400 font-medium">Gestão de acessos, credenciais e permissões.</p>
          </div>
          <button onClick={() => openForm()} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-500 shadow-md transition-colors flex gap-2 items-center">
            <span>+</span> Novo Membro
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">A carregar acessos...</p>
        ) : staffList.length === 0 ? (
          <div className="bg-[#151c2c] p-10 rounded-2xl border border-slate-800/80 text-center">
            <h3 className="text-white font-semibold text-base">Sem Staff</h3>
            <p className="text-sm text-slate-400 mt-1">Adicione membros para lhes dar acesso à plataforma.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {staffList.map(member => (
              <div key={member.id} className={`bg-[#151c2c] p-3 md:p-4 rounded-xl border ${member.id === currentUser.id ? 'border-blue-500/50 shadow-blue-900/10' : 'border-slate-800/80'} flex flex-col md:flex-row items-center gap-4 hover:border-slate-600 transition-colors relative shadow-sm`}>
                
                <div className="w-11 h-11 shrink-0 rounded-full bg-slate-800 flex items-center justify-center text-base font-bold text-slate-300 shadow-sm border border-slate-700">
                  {member.name.substring(0, 2).toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-[150px] w-full text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                    <h3 className="text-base font-semibold text-slate-100 truncate" title={member.name}>{member.name}</h3>
                    {member.id === currentUser.id && (
                      <span className="bg-blue-600/20 text-blue-400 border border-blue-600/30 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md inline-block self-center">Você</span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5 block truncate" title={member.role}>{member.role}</span>
                </div>
                
                <div className="flex flex-col text-xs font-medium text-slate-400 w-full md:w-auto text-center md:text-left shrink-0 mt-1 md:mt-0 md:px-4">
                  <span className="truncate" title={member.username}>📧 {member.username}</span>
                  <span className="truncate mt-1" title={member.phone || 'Sem contacto'}>📱 {member.phone || 'S/ Contacto'}</span>
                </div>

                <div className="flex gap-2 w-full md:w-auto shrink-0 justify-center mt-3 md:mt-0">
                  <button onClick={() => openForm(member)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-700">Editar</button>
                  <button 
                    onClick={() => handleDeleteClick(member.id, member.name)} 
                    disabled={member.id === currentUser.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${member.id === currentUser.id ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed' : 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border-red-500/20'}`}
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

  return (
    <div className="p-2 md:p-6 max-w-3xl mx-auto">
      <div className="bg-[#151c2c] p-6 md:p-8 rounded-2xl border border-slate-800/80 shadow-lg">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">{current ? 'Editar Acesso' : 'Adicionar Elemento ao Staff'}</h2>
          <button onClick={() => setView('list')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancelar</button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-800/80">
            <h3 className="text-blue-400 font-bold mb-4 uppercase text-[10px] tracking-widest">Dados de Acesso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email (Login) *</label>
                <input required type="email" name="username" defaultValue={current?.username} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Password {current && '(Se alterar, o acesso fica provisório)'}</label>
                <input required type="text" name="password" defaultValue={current?.password} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="••••••••" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-800/80">
            <h3 className="text-blue-400 font-bold mb-4 uppercase text-[10px] tracking-widest">Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nome Completo *</label>
                <input required type="text" name="name" defaultValue={current?.name} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Cargo *</label>
                <select required name="role" defaultValue={current?.role || 'Treinador Adjunto'} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
              <div className="col-span-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Telemóvel</label>
                <input type="text" name="phone" defaultValue={current?.phone} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: 912 345 678" />
              </div>
              <div className="col-span-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Idade</label>
                <input type="number" name="age" defaultValue={current?.age} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div className="col-span-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Morada</label>
                <input type="text" name="address" defaultValue={current?.address} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg shadow-md transition-colors text-sm mt-2">
            {current ? 'Atualizar Dados' : 'Criar Acesso'}
          </button>
        </form>
      </div>
    </div>
  );
}