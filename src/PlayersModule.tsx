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

// A CULPADA ESTAVA AQUI! Agora estão só os parênteses vazios.
export default function PlayersModule() {
  const [extPlayers, setExtPlayers] = useState<PlayerExtended[]>([]);
  const [view, setView] = useState<'grid' | 'form' | 'details'>('grid');
  const [current, setCurrent] = useState<PlayerExtended | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newWeight = Number(fd.get('weight'));

    // Lógica do Histórico de Peso
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
      alert("Erro ao guardar: " + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem a certeza que quer eliminar ${name} do plantel?`)) return;
    try {
      await supabase.from('players').delete().eq('id', id);
      window.location.reload();
    } catch (err: any) {
      alert("Erro ao eliminar: " + err.message);
    }
  };

  const openForm = (player: PlayerExtended | null = null) => {
    setCurrent(player);
    setView('form');
  };

  const openDetails = (player: PlayerExtended) => {
    setCurrent(player);
    setView('details');
  };

  if (view === 'grid') {
    return (
      <div className="p-2 md:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white">Plantel</h2>
            <p className="text-slate-400">Gira os seus atletas, avalie o peso e atualize os dados.</p>
          </div>
          <button onClick={() => openForm()} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 shadow-md transition-colors flex gap-2 items-center">
            <span>+</span> Novo Jogador
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400">A carregar plantel...</p>
        ) : extPlayers.length === 0 ? (
          <div className="bg-slate-800 p-10 rounded-2xl border border-slate-700 text-center">
            <span className="text-4xl mb-4 block">👕</span>
            <h3 className="text-white font-bold text-lg">Plantel Vazio</h3>
            <p className="text-slate-400 mt-2">Adicione o seu primeiro jogador à equipa.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {extPlayers.map(player => (
              <div key={player.id} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg hover:border-slate-500 transition-colors flex flex-col">
                <div className="h-32 bg-slate-900 flex justify-center items-end pb-4 relative">
                  <div className="absolute top-3 left-3 bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-md border border-slate-700 font-bold">
                    {player.position}
                  </div>
                  {player.photo_url ? (
                    <img src={player.photo_url} alt={player.name} className="w-20 h-20 rounded-full object-cover border-4 border-slate-800 shadow-lg" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-black border-4 border-slate-800 shadow-lg">
                      {player.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col text-center">
                  <h3 className="text-lg font-black text-white mb-1">{player.name}</h3>
                  <div className="flex justify-center gap-3 text-xs font-semibold text-slate-400 mb-4">
                    <span>{player.age ? `${player.age} anos` : 'Idade N/D'}</span>
                    <span>•</span>
                    <span>Pé {player.preferred_foot}</span>
                  </div>
                  
                  <div className="flex justify-center gap-4 mb-6 bg-slate-900/50 p-2 rounded-lg border border-slate-700">
                    <div className="text-center">
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Altura</span>
                      <span className="font-bold text-slate-300">{player.height ? `${player.height}m` : '-'}</span>
                    </div>
                    <div className="w-px bg-slate-700"></div>
                    <div className="text-center">
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Peso</span>
                      <span className="font-bold text-slate-300">{player.weight ? `${player.weight}kg` : '-'}</span>
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-3 gap-2">
                    <button onClick={() => openDetails(player)} className="col-span-3 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-bold transition-colors">Ver Ficha</button>
                    <button onClick={() => openForm(player)} className="col-span-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white py-2 rounded-lg text-sm font-bold border border-blue-500/20 transition-all">Editar</button>
                    <button onClick={() => handleDelete(player.id, player.name)} className="col-span-1 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white py-2 rounded-lg text-sm font-bold border border-red-500/20 transition-all">🗑️</button>
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
        <button onClick={() => setView('grid')} className="text-blue-400 font-bold mb-6 hover:text-blue-300">← Voltar ao Plantel</button>
        
        <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-xl">
          <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start border-b border-slate-700">
            {current.photo_url ? (
              <img src={current.photo_url} alt={current.name} className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-lg border-4 border-slate-700" />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-5xl font-black shadow-lg">
                {current.name.charAt(0)}
              </div>
            )}
            
            <div className="flex-1">
              <div className="bg-slate-700 inline-block px-3 py-1 rounded-lg text-sm font-bold text-slate-300 mb-3">{current.position}</div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-4">{current.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-400">
                <span className="bg-slate-900 px-3 py-1.5 rounded-lg">Idade: {current.age || 'N/D'}</span>
                <span className="bg-slate-900 px-3 py-1.5 rounded-lg">Pé: {current.preferred_foot}</span>
                <span className="bg-slate-900 px-3 py-1.5 rounded-lg">Nascimento: {current.birth_date ? new Date(current.birth_date).toLocaleDateString('pt-PT') : 'N/D'}</span>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Evolução do Peso</h3>
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="block text-xs text-slate-500 uppercase font-bold">Peso Atual</span>
                    <span className="text-2xl font-black text-white">{current.weight ? `${current.weight} kg` : '--'}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-slate-500 uppercase font-bold">Altura</span>
                    <span className="text-2xl font-black text-white">{current.height ? `${current.height} m` : '--'}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Histórico na Época</h4>
                  {(current.weight_history || []).length > 0 ? (
                    <div className="space-y-3">
                      {current.weight_history.map((record, i) => (
                        <div key={i} className="flex justify-between items-center text-sm bg-slate-800 px-4 py-2 rounded-lg border border-slate-700/50">
                          <span className="text-slate-400">{new Date(record.date).toLocaleDateString('pt-PT')}</span>
                          <span className="font-bold text-blue-400">{record.weight} kg</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">Sem registos anteriores de peso.</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-4">Notas da Equipa Técnica</h3>
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 h-full min-h-[200px]">
                <p className="text-slate-300 whitespace-pre-wrap">{current.notes || 'Nenhuma nota registada para este jogador.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6 max-w-4xl mx-auto">
      <div className="bg-slate-800 p-6 md:p-10 rounded-3xl border border-slate-700 shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-white">{current ? 'Editar Jogador' : 'Novo Jogador'}</h2>
          <button onClick={() => setView('grid')} className="text-slate-400 hover:text-white font-bold">✕ Cancelar</button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Nome Completo *</label>
              <input required type="text" name="name" defaultValue={current?.name} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Posição *</label>
              <select name="position" defaultValue={current?.position || 'Guarda-Redes'} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="col-span-1">
              <label className="block text-sm font-bold text-slate-300 mb-2">Idade</label>
              <input type="number" name="age" defaultValue={current?.age} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-bold text-slate-300 mb-2">Nascimento</label>
              <input type="date" name="birth_date" defaultValue={current?.birth_date} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-300 mb-2">Pé Preferencial</label>
              <select name="preferred_foot" defaultValue={current?.preferred_foot || 'Destro'} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option>Destro</option>
                <option>Esquerdino</option>
                <option>Ambidestro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Altura (m) <span className="text-slate-500 font-normal">Ex: 1.85</span></label>
              <input type="number" step="0.01" name="height" defaultValue={current?.height} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="1.85" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Peso (kg) <span className="text-slate-500 font-normal">Ex: 75.5</span></label>
              <input type="number" step="0.1" name="weight" defaultValue={current?.weight} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="75.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">URL da Foto (Opcional)</label>
            <input type="url" name="photo_url" defaultValue={current?.photo_url} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Notas Rápidas</label>
            <textarea name="notes" defaultValue={current?.notes} rows={4} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none custom-scrollbar" placeholder="Anotações sobre comportamento, lesões..."></textarea>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-colors text-lg mt-4">
            {current ? 'Guardar Alterações' : 'Adicionar ao Plantel'}
          </button>
        </form>
      </div>
    </div>
  );
}