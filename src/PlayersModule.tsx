import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

interface WeightRecord {
  date: string;
  weight: number;
}

interface PlayerExtended {
  id: string;
  team_id: string;
  name: string;
  age: number | string;
  position: string;
  preferred_foot: string;
  birth_date: string;
  notes: string;
  photo_url: string;
  height: number | string;
  weight: number | string;
  weight_history: WeightRecord[];
}

export default function PlayersModule() {
  const [extPlayers, setExtPlayers] = useState<PlayerExtended[]>([]);
  const [view, setView] = useState<'grid' | 'form' | 'details'>('grid');
  const [current, setCurrent] = useState<PlayerExtended | null>(null);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
    type: 'alert' | 'confirm';
  }>({ show: false, title: '', message: '', onConfirm: null, type: 'alert' });

  const activeTeam = JSON.parse(localStorage.getItem('scoutpro_active_team') || '{}');

  const fetchPlayers = async () => {
    if (!activeTeam.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', activeTeam.id)
        .order('position')
        .order('name');
      if (error) throw error;
      if (data) setExtPlayers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [activeTeam.id]);

  const openAlert = (title: string, message: string) => setModal({ show: true, title, message, onConfirm: null, type: 'alert' });
  const openConfirm = (title: string, message: string, onConfirm: () => void) => setModal({ show: true, title, message, onConfirm, type: 'confirm' });
  const closeModal = () => setModal(prev => ({ ...prev, show: false }));

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newWeight = Number(fd.get('weight'));

    let history = current?.weight_history || [];
    if (newWeight && newWeight !== Number(current?.weight)) {
      history = [...history, { date: new Date().toISOString().split('T')[0], weight: newWeight }];
    }

    const payload = {
      team_id: activeTeam.id,
      name: fd.get('name'),
      age: fd.get('age') || null,
      position: fd.get('position'),
      preferred_foot: fd.get('preferred_foot'),
      birth_date: fd.get('birth_date') || null,
      photo_url: fd.get('photo_url'),
      notes: fd.get('notes'),
      height: fd.get('height') || null,
      weight: newWeight || null,
      weight_history: history
    };

    try {
      if (current?.id) {
        await supabase.from('players').update(payload).eq('id', current.id);
      } else {
        await supabase.from('players').insert([payload]);
      }
      window.location.reload();
    } catch (err: any) {
      openAlert("Erro", `Erro ao guardar: ${err.message}`);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    openConfirm(
      "Remover Jogador",
      `Tem a certeza que deseja eliminar ${name} do plantel? Esta ação apagará todos os dados clínicos e desportivos deste atleta.`,
      async () => {
        try {
          const { error } = await supabase.from('players').delete().eq('id', id);
          if (error) throw error;
          window.location.reload();
        } catch (err: any) {
          openAlert("Erro", `Erro ao eliminar: ${err.message}`);
        }
      }
    );
  };

  const openForm = (player: PlayerExtended | null = null) => {
    setCurrent(player);
    setView('form');
  };

  const openDetails = (player: PlayerExtended) => {
    setCurrent(player);
    setView('details');
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

  if (view === 'grid') {
    return (
      <div className="p-2 md:p-6 max-w-5xl mx-auto relative">
        {renderModal()}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800/60 pb-6">
          <div className="text-left">
            <h2 className="text-2xl font-semibold text-white tracking-tight mb-1">Plantel</h2>
            <p className="text-sm text-slate-400 font-medium">Gira os seus atletas, avalie o peso e atualize os dados.</p>
          </div>
          <button onClick={() => openForm()} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all flex gap-2 items-center w-full md:w-auto justify-center">
            <span>+</span> Novo Jogador
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400 animate-pulse">A carregar plantel...</p>
        ) : extPlayers.length === 0 ? (
          <div className="bg-[#0f1523] p-12 rounded-2xl border border-slate-800/60 text-center">
            <span className="text-4xl mb-4 block opacity-50">👕</span>
            <h3 className="text-white font-semibold text-lg">Plantel Vazio</h3>
            <p className="text-sm text-slate-400 mt-2">Adicione o seu primeiro jogador à equipa.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {extPlayers.map(player => (
              <div key={player.id} className="bg-[#151c2c] p-3 md:p-4 rounded-xl border border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-slate-700 transition-colors shadow-sm group">
                
                {/* 1. Bloco da Esquerda: Avatar e Nome */}
                <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto md:flex-1 min-w-0">
                  <div className="shrink-0 relative">
                    {player.photo_url ? (
                      <img src={player.photo_url} alt={player.name} className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border border-slate-700 shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 text-base font-bold border border-slate-700 shadow-sm">
                        {player.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Agora usa 'truncate' para que o nome nunca passe para a 2ª linha, ocupando todo o espaço livre */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="text-sm md:text-base font-semibold text-slate-100 truncate" title={player.name}>{player.name}</h3>
                    <span className="text-[9px] md:text-[10px] font-bold text-blue-400/90 uppercase tracking-widest mt-0.5 block truncate">{player.position}</span>
                  </div>
                </div>
                
                {/* 2. Bloco da Direita: Stats e Ícones */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full md:w-auto shrink-0 mt-3 md:mt-0">
                  
                  {/* Estatísticas */}
                  <div className="flex items-center justify-center gap-3 shrink-0 bg-slate-800/30 md:bg-transparent px-4 py-2 md:p-0 rounded-lg w-full md:w-auto">
                    <div className="text-center w-10">
                      <span className="block text-[8px] md:text-[9px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Idade</span>
                      <span className="font-medium text-slate-300 text-xs">{player.age ? `${player.age}` : '-'}</span>
                    </div>
                    <div className="w-px h-5 bg-slate-700/50"></div>
                    <div className="text-center w-10">
                      <span className="block text-[8px] md:text-[9px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Pé</span>
                      <span className="font-medium text-slate-300 text-xs">{player.preferred_foot.substring(0, 3)}</span>
                    </div>
                    <div className="w-px h-5 bg-slate-700/50"></div>
                    <div className="text-center w-16">
                      <span className="block text-[8px] md:text-[9px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Alt/Peso</span>
                      <span className="font-medium text-slate-300 text-xs">{player.height ? `${player.height}` : '-'}/{player.weight ? `${player.weight}` : '-'}</span>
                    </div>
                  </div>

                  {/* Ações substituídas por ícones minimalistas */}
                  <div className="flex items-center justify-center gap-2 shrink-0 md:ml-2">
                    <button onClick={() => openDetails(player)} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700/50 shadow-sm" title="Ver Ficha Clínica e Histórico">
                      📄
                    </button>
                    <button onClick={() => openForm(player)} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-colors border border-blue-500/20 shadow-sm" title="Editar Jogador">
                      ✏️
                    </button>
                    <button onClick={() => handleDeleteClick(player.id, player.name)} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20 shadow-sm" title="Eliminar Jogador">
                      🗑️
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === 'details' && current) {
    return (
      <div className="p-2 md:p-6 max-w-4xl mx-auto">
        <button onClick={() => setView('grid')} className="text-slate-400 text-sm font-medium mb-6 hover:text-white transition-colors">← Voltar ao Plantel</button>
        
        <div className="bg-[#151c2c] rounded-2xl border border-slate-800/60 overflow-hidden shadow-lg">
          <div className="p-8 flex flex-col md:flex-row gap-6 items-start border-b border-slate-800/60">
            {current.photo_url ? (
              <img src={current.photo_url} alt={current.name} className="w-28 h-28 rounded-2xl object-cover shadow-sm border border-slate-700" />
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 text-4xl font-bold shadow-sm border border-slate-700">
                {current.name.charAt(0)}
              </div>
            )}
            
            <div className="flex-1 min-w-0 pt-2">
              <div className="bg-slate-800/80 inline-block px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-300 mb-3 border border-slate-700">{current.position}</div>
              <h1 className="text-2xl md:text-3xl font-semibold text-white mb-3 truncate" title={current.name}>{current.name}</h1>
              <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-400">
                <span className="bg-[#0f1523] px-3 py-1.5 rounded-lg border border-slate-800">Idade: <strong className="text-slate-200">{current.age || '-'}</strong></span>
                <span className="bg-[#0f1523] px-3 py-1.5 rounded-lg border border-slate-800">Pé: <strong className="text-slate-200">{current.preferred_foot}</strong></span>
                <span className="bg-[#0f1523] px-3 py-1.5 rounded-lg border border-slate-800">Nascimento: <strong className="text-slate-200">{current.birth_date ? new Date(current.birth_date).toLocaleDateString('pt-PT') : '-'}</strong></span>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wide">Evolução Física</h3>
              <div className="bg-[#0f1523] p-5 rounded-xl border border-slate-800/60">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Peso Atual</span>
                    <span className="text-xl font-bold text-white">{current.weight ? `${current.weight} kg` : '--'}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Altura</span>
                    <span className="text-xl font-bold text-white">{current.height ? `${current.height} m` : '--'}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800/60 pt-4">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Histórico</h4>
                  {(current.weight_history || []).length > 0 ? (
                    <div className="space-y-2">
                      {current.weight_history.map((record, i) => (
                        <div key={i} className="flex justify-between items-center text-xs bg-slate-800/30 px-3 py-2 rounded-md border border-slate-700/30">
                          <span className="text-slate-400">{new Date(record.date).toLocaleDateString('pt-PT')}</span>
                          <span className="font-semibold text-blue-400">{record.weight} kg</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Sem registos anteriores de peso.</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wide">Anotações Clínicas / Técnicas</h3>
              <div className="bg-[#0f1523] p-5 rounded-xl border border-slate-800/60 h-full min-h-[200px]">
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{current.notes || 'Sem observações registadas.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6 max-w-3xl mx-auto">
      {renderModal()}
      
      <div className="bg-[#151c2c] p-6 md:p-8 rounded-2xl border border-slate-800/60 shadow-lg">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/60">
          <h2 className="text-xl font-semibold text-white">{current ? 'Editar Ficha do Jogador' : 'Adicionar Novo Jogador'}</h2>
          <button onClick={() => setView('grid')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancelar</button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nome Completo *</label>
              <input required type="text" name="name" defaultValue={current?.name} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Posição *</label>
              <select name="position" defaultValue={current?.position || 'Guarda-Redes'} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all">
                <option>Guarda-Redes</option>
                <option>Defesa Central</option>
                <option>Defesa Lateral</option>
                <option>Médio Defensivo</option>
                <option>Médio Centro</option>
                <option>Médio Ofensivo</option>
                <option>Extremo</option>
                <option>Avançado Centro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="col-span-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Idade</label>
              <input type="number" name="age" defaultValue={current?.age} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="col-span-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nascimento</label>
              <input type="date" name="birth_date" defaultValue={current?.birth_date} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Pé Preferencial</label>
              <select name="preferred_foot" defaultValue={current?.preferred_foot || 'Destro'} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all">
                <option>Destro</option>
                <option>Esquerdino</option>
                <option>Ambidestro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 bg-slate-800/20 p-4 rounded-xl border border-slate-800/60">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Altura (m)</label>
              <input type="number" step="0.01" name="height" defaultValue={current?.height} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: 1.85" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Peso (kg)</label>
              <input type="number" step="0.1" name="weight" defaultValue={current?.weight} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: 75.5" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">URL da Foto (Opcional)</label>
            <input type="url" name="photo_url" defaultValue={current?.photo_url} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="https://..." />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Observações Adicionais</label>
            <textarea name="notes" defaultValue={current?.notes} rows={3} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all custom-scrollbar" placeholder="Anotações sobre perfil clínico, comportamental..."></textarea>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg shadow-md transition-colors text-sm mt-2">
            {current ? 'Guardar Ficha do Jogador' : 'Adicionar ao Plantel'}
          </button>
        </form>
      </div>
    </div>
  );
}