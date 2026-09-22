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
      alert(`Erro ao guardar: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (id === currentUser.id) {
      alert("Não se pode eliminar a si próprio!");
      return;
    }
    
    if (!window.confirm(`Tem a certeza que deseja eliminar o acesso de ${name}? Esta ação não pode ser revertida.`)) return;
    
    try {
      const { error } = await supabase.from('staff').delete().eq('id', id);
      if (error) throw error;
      window.location.reload();
    } catch (err: any) {
      alert(`Erro ao eliminar: ${err.message}`);
    }
  };

  const openForm = (staff: StaffMemberExtended | null = null) => {
    setCurrent(staff);
    setView('form');
  };

  if (view === 'list') {
    return (
      <div className="p-2 md:p-6 max-w-7xl mx-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staffList.map(member => (
              <div key={member.id} className={`bg-slate-800 p-6 rounded-2xl border ${member.id === currentUser.id ? 'border-blue-500/50 shadow-blue-900/20' : 'border-slate-700'} shadow-lg hover:border-slate-500 transition-colors relative flex flex-col h-full`}>
                
                {member.id === currentUser.id && (
                  <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md">Você</div>
                )}
                
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center text-xl font-black text-white shadow-inner">
                    {member.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white leading-tight">{member.name}</h3>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">{member.role}</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6 flex-1">
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <span>📧</span> <span className="font-semibold text-slate-300">{member.username}</span>
                  </p>
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <span>📱</span> {member.phone || 'Sem contacto'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <button onClick={() => openForm(member)} className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-bold transition-colors">
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(member.id, member.name)} 
                    disabled={member.id === currentUser.id}
                    className={`py-2 rounded-lg text-sm font-bold border transition-all ${member.id === currentUser.id ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed' : 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border-red-500/20'}`}
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