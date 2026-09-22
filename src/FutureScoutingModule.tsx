import React, { useState, useRef, useEffect } from 'react';
import { FutureOpponentScouting } from './types';
import { supabase } from './supabase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface FutureScoutingModuleProps {
  reports: FutureOpponentScouting[];
}

// ==========================================
// COMPONENTE: QUADRO TÁTICO
// ==========================================
const TacticalCanvas = ({ defaultImage, onChange }: { defaultImage?: string, onChange: (img: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<string[]>([]);

  const initPitch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#0f1523';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, w - 60, h - 60);
    ctx.beginPath();
    ctx.moveTo(w / 2, 30);
    ctx.lineTo(w / 2, h - 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 50, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeRect(30, h / 2 - 80, 100, 160);
    ctx.strokeRect(w - 130, h / 2 - 80, 100, 160);
  };

  const loadSnapshot = (dataUrl: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  };

  useEffect(() => {
    if (defaultImage && defaultImage.startsWith('data:image')) {
      loadSnapshot(defaultImage);
      setHistory([defaultImage]);
    } else {
      initPitch();
      saveSnapshot();
    }
    // eslint-disable-next-line
  }, []);

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setHistory(prev => [...prev, dataUrl]);
    onChange(dataUrl);
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const previous = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      loadSnapshot(previous);
      onChange(previous);
    } else if (history.length === 1) {
      initPitch();
      const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        setHistory([dataUrl]);
        onChange(dataUrl);
      }
    }
  };

  const handleClear = () => {
    initPitch();
    saveSnapshot();
  };

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    if (tool === 'draw') {
      setIsDrawing(true);
      setLastPos(pos);
    } else {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icons: any = { 'cone': '🔺', 'goal': '🥅', 't1': '🔴', 't2': '🔵', 't3': '🟡', 't4': '⚫' };
      ctx.fillText(icons[tool] || '', pos.x, pos.y);
      saveSnapshot();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== 'draw') return;
    const pos = getPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setLastPos(pos);
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveSnapshot();
    }
  };

  const toolsList = [
    { id: 'draw', label: '✏️ Linhas' },
    { id: 't1', label: '🔴 Adv.' },
    { id: 't2', label: '🔵 Nossa Equipa' },
  ];

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 bg-[#090e17] p-2 rounded-xl border border-slate-700/80">
        {toolsList.map((t: any) => (
          <button key={t.id} type="button" onClick={() => setTool(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tool === t.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}>
            {t.label}
          </button>
        ))}
        <div className="flex-1"></div>
        <button type="button" onClick={handleUndo} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700">↩️ Desfazer</button>
        <button type="button" onClick={handleClear} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white">🗑️ Limpar</button>
      </div>
      <div className="w-full bg-[#090e17] rounded-xl border-2 border-slate-700/80 overflow-hidden relative">
        <canvas ref={canvasRef} width={800} height={400} className="w-full h-auto cursor-crosshair" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} style={{ touchAction: 'none' }} />
      </div>
    </div>
  );
};

// ==========================================
// MÓDULO PRINCIPAL DE SCOUTING
// ==========================================
export default function FutureScoutingModule({ reports }: FutureScoutingModuleProps) {
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [current, setCurrent] = useState<FutureOpponentScouting | null>(null);
  
  // ESTADOS DAS IMAGENS
  const [boardImage, setBoardImage] = useState<string>('');
  const [offCornerImg, setOffCornerImg] = useState<string>('');
  const [defCornerImg, setDefCornerImg] = useState<string>('');
  
  const [pdfLoading, setPdfLoading] = useState(false);

  const activeTeam = JSON.parse(localStorage.getItem('scoutpro_active_team') || '{}');

  // FUNÇÃO DE COMPRESSÃO E CARREGAMENTO DE IMAGEM
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setImg: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar imagem para poupar espaço na BD (Máximo 800px largura)
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Converte para JPEG com 80% de qualidade
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setImg(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const payload: any = {
      team_id: activeTeam.id,
      opponent_name: fd.get('opponentName'),
      observation_date: fd.get('observationDate'),
      tactical_model: fd.get('tacticalModel'),
      attacking_formation: fd.get('attackingFormation'),
      defending_formation: fd.get('defendingFormation'),
      offensive_corners: fd.get('offensiveCorners'),
      defensive_corners: fd.get('defensiveCorners'),
      offensive_corners_photo_url: offCornerImg, // Imagem galeria
      defensive_corners_photo_url: defCornerImg, // Imagem galeria
      strengths: fd.get('strengths'),
      weaknesses: fd.get('weaknesses'),
      strong_players: fd.get('strongPlayers'),
      weak_players: fd.get('weakPlayers'),
      observations: fd.get('observations'),
      formation_board_image: boardImage
    };

    try {
      if (current?.id) {
        await supabase.from('future_scouting').update(payload).eq('id', current.id);
      } else {
        await supabase.from('future_scouting').insert([payload]);
      }
      window.location.reload();
    } catch (err: any) {
      alert("Erro ao guardar relatório: " + err.message);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Tem a certeza que deseja eliminar o relatório do jogo contra ${name}?`)) return;
    supabase.from('future_scouting').delete().eq('id', id).then(({error}) => {
      if(error) alert(error.message);
      else window.location.reload();
    });
  };

  const openForm = (report: FutureOpponentScouting | null = null) => {
    setCurrent(report);
    setBoardImage(report?.formationBoardImage || '');
    setOffCornerImg(report?.offensiveCornersPhotoUrl || '');
    setDefCornerImg(report?.defensiveCornersPhotoUrl || '');
    setView('form');
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('pdf-content');
    if (!element) return;
    
    try {
      setPdfLoading(true);
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      const pdfWidth = 210; 
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width; 
      
      const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Scouting_${current?.opponentName || 'Adversario'}.pdf`);
    } catch (error) {
      alert('Erro ao gerar PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  if (view === 'list') {
    return (
      <div className="p-2 md:p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/60 pb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight mb-1">Adversários / Scouting</h2>
            <p className="text-sm text-slate-400 font-medium">Relatórios detalhados, quadros táticos e análise de pontos fortes.</p>
          </div>
          <button onClick={() => openForm()} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all flex gap-2 items-center">
            <span>+</span> Adicionar Observação
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="bg-[#0f1523] p-12 rounded-2xl border border-slate-800/60 text-center">
            <span className="text-4xl mb-4 block opacity-50">🔭</span>
            <h3 className="text-white font-semibold text-lg">Sem relatórios de Scouting</h3>
            <p className="text-sm text-slate-400 mt-2">Comece a preparar a sua equipa para o próximo adversário.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map(r => (
              <div key={r.id} className="bg-[#151c2c] p-5 rounded-2xl border border-slate-800/60 hover:border-slate-700 transition-colors shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                      {new Date(r.observationDate).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{r.opponentName}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{r.tacticalModel || 'Sem modelo tático descrito.'}</p>
                </div>

                <div className="flex gap-2 mt-6">
                  <button onClick={() => { setCurrent(r); setView('details'); }} className="flex-1 py-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium transition-colors border border-slate-700/50">Ver Detalhes</button>
                  <button onClick={() => openForm(r)} className="flex-1 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-[11px] font-medium border border-blue-500/20 transition-colors">Editar</button>
                  <button onClick={() => handleDelete(r.id, r.opponentName)} className="w-10 flex items-center justify-center py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // VISTA 2: RELATÓRIO PDF DINÂMICO
  if (view === 'details' && current) {
    return (
      <div className="p-2 md:p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setView('list')} className="text-slate-400 text-sm font-medium hover:text-white transition-colors">← Voltar</button>
          <button onClick={handleDownloadPDF} disabled={pdfLoading} className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-500 shadow-md transition-all flex gap-2 items-center disabled:opacity-50">
            {pdfLoading ? 'A gerar...' : '📄 Descarregar PDF Profissional'}
          </button>
        </div>
        
        <div className="overflow-x-auto pb-8 flex justify-center custom-scrollbar">
          <div id="pdf-content" className="bg-white shrink-0 shadow-2xl flex flex-col box-border" style={{ width: '794px', padding: '40px' }}>
            
            {/* CABEÇALHO */}
            <div className="flex justify-between items-end border-b-2 border-slate-800 pb-4 mb-6">
               <div>
                 <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight m-0">Relatório de Scouting</h1>
                 <p className="text-sm text-slate-600 font-bold mt-1 m-0">{activeTeam.club} • {activeTeam.year}</p>
               </div>
               <div className="text-right">
                 <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Adversário</span>
                 <span className="text-2xl font-black text-blue-600 m-0">{current.opponentName}</span>
                 <span className="block text-xs font-bold text-slate-700 mt-1">{new Date(current.observationDate).toLocaleDateString('pt-PT')}</span>
               </div>
            </div>

            {/* FORMAÇÕES */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-300">
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Formação a Atacar</span>
                <h2 className="text-base font-bold text-slate-900 m-0">{current.attackingFormation || '-'}</h2>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-300">
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Formação a Defender</span>
                <h2 className="text-base font-bold text-slate-900 m-0">{current.defendingFormation || '-'}</h2>
              </div>
            </div>

            {/* TÁTICA */}
            {current.tacticalModel && (
              <div className="mb-6">
                <h3 className="text-xs font-black uppercase text-slate-900 mb-2 border-b border-slate-300 pb-1">Modelo Tático / Ideia de Jogo</h3>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed m-0">{current.tacticalModel}</p>
              </div>
            )}

            {/* QUADRO TÁTICO */}
            {current.formationBoardImage && (
              <div className="mb-6">
                <h3 className="text-xs font-black uppercase text-slate-900 mb-2 border-b border-slate-300 pb-1">Disposição Tática (11 Inicial)</h3>
                <div className="w-full flex justify-center bg-[#090e17] rounded-lg overflow-hidden border border-slate-300 mt-2 p-1">
                  <img src={current.formationBoardImage} alt="Quadro Tático" className="w-full object-contain" />
                </div>
              </div>
            )}

            {/* CANTOS (C/ FOTOGRAFIA) */}
            <div className="grid grid-cols-2 gap-6 mb-6">
               <div>
                 <h3 className="text-xs font-black uppercase text-slate-900 mb-2 border-b border-slate-300 pb-1">Cantos Ofensivos</h3>
                 <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed mb-3">{current.offensiveCorners || '-'}</p>
                 {current.offensiveCornersPhotoUrl && (
                   <img src={current.offensiveCornersPhotoUrl} alt="Canto Ofensivo" className="w-full rounded border border-slate-300 object-cover" />
                 )}
               </div>
               <div>
                 <h3 className="text-xs font-black uppercase text-slate-900 mb-2 border-b border-slate-300 pb-1">Cantos Defensivos</h3>
                 <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed mb-3">{current.defensiveCorners || '-'}</p>
                 {current.defensiveCornersPhotoUrl && (
                   <img src={current.defensiveCornersPhotoUrl} alt="Canto Defensivo" className="w-full rounded border border-slate-300 object-cover" />
                 )}
               </div>
            </div>

            {/* PONTOS FORTES E FRACOS */}
            <div className="grid grid-cols-2 gap-6 mb-6">
               <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-200">
                 <h3 className="text-xs font-black uppercase text-emerald-800 mb-2">Pontos Fortes da Equipa</h3>
                 <p className="text-sm text-emerald-900 whitespace-pre-wrap leading-relaxed m-0">{current.strengths || '-'}</p>
               </div>
               <div className="bg-red-50/50 p-4 rounded-lg border border-red-200">
                 <h3 className="text-xs font-black uppercase text-red-800 mb-2">Pontos Fracos a Explorar</h3>
                 <p className="text-sm text-red-900 whitespace-pre-wrap leading-relaxed m-0">{current.weaknesses || '-'}</p>
               </div>
            </div>

            {/* JOGADORES ESPECÍFICOS */}
            <div className="grid grid-cols-2 gap-6 mb-6">
               <div>
                 <h3 className="text-xs font-black uppercase text-slate-900 mb-2 border-b border-slate-300 pb-1">Jogadores a Ter em Conta</h3>
                 <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed m-0">{current.strongPlayers || '-'}</p>
               </div>
               <div>
                 <h3 className="text-xs font-black uppercase text-slate-900 mb-2 border-b border-slate-300 pb-1">Jogadores a Explorar (Debilidades)</h3>
                 <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed m-0">{current.weakPlayers || '-'}</p>
               </div>
            </div>

            {/* OBSERVAÇÕES */}
            {current.observations && (
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 mb-2 border-b border-slate-300 pb-1">Observações Finais Extras</h3>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed m-0">{current.observations}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // VISTA 3: FORMULÁRIO GIGANTE DE SCOUTING
  return (
    <div className="p-2 md:p-6 max-w-4xl mx-auto">
      <div className="bg-[#151c2c] p-6 md:p-8 rounded-2xl border border-slate-800/60 shadow-lg">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/60">
          <h2 className="text-xl font-semibold text-white">{current ? 'Editar Relatório de Scouting' : 'Nova Observação'}</h2>
          <button onClick={() => setView('list')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancelar</button>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Data da Observação *</label>
              <input required type="date" name="observationDate" defaultValue={current?.observationDate} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Adversário *</label>
              <input required type="text" name="opponentName" defaultValue={current?.opponentName} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: FC Porto Sub-19" />
            </div>
          </div>

          <div className="bg-slate-800/20 p-5 rounded-xl border border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Formação a Atacar</label>
              <input type="text" name="attackingFormation" defaultValue={current?.attackingFormation} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: 1-4-3-3 Ofensivo" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Formação a Defender</label>
              <input type="text" name="defendingFormation" defaultValue={current?.defendingFormation} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: 1-4-5-1 Bloco Baixo" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Modelo Tático / Ideia de Jogo</label>
              <textarea name="tacticalModel" defaultValue={current?.tacticalModel} rows={3} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none custom-scrollbar" placeholder="Como constroem? Como reagem à perda da bola?"></textarea>
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Disposição Tática e Movimentos (Quadro Interativo)</label>
            <TacticalCanvas defaultImage={boardImage} onChange={setBoardImage} />
          </div>

          {/* CANTOS COM UPLOAD DE FOTOS */}
          <div className="border-t border-slate-800/60 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/20 p-5 rounded-xl border border-slate-800/60 flex flex-col">
              <h3 className="text-blue-400 font-bold mb-3 uppercase text-[10px] tracking-widest">Cantos Ofensivos</h3>
              <textarea name="offensiveCorners" defaultValue={current?.offensiveCorners} rows={3} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none custom-scrollbar mb-4" placeholder="Para onde batem? Quantos na área?"></textarea>
              
              <div className="mt-auto">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">📸 Fotografia do Canto (Galeria/PC)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, setOffCornerImg)} 
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 transition-all cursor-pointer" 
                />
                {offCornerImg && (
                  <div className="mt-3 relative inline-block">
                    <button type="button" onClick={() => setOffCornerImg('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md">✕</button>
                    <img src={offCornerImg} alt="Preview" className="h-32 object-cover rounded border border-slate-700 shadow-sm" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-slate-800/20 p-5 rounded-xl border border-slate-800/60 flex flex-col">
              <h3 className="text-blue-400 font-bold mb-3 uppercase text-[10px] tracking-widest">Cantos Defensivos</h3>
              <textarea name="defensiveCorners" defaultValue={current?.defensiveCorners} rows={3} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none custom-scrollbar mb-4" placeholder="Tipo de marcação? Zona, HxH, mista?"></textarea>
              
              <div className="mt-auto">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">📸 Fotografia do Canto (Galeria/PC)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, setDefCornerImg)} 
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 transition-all cursor-pointer" 
                />
                {defCornerImg && (
                  <div className="mt-3 relative inline-block">
                    <button type="button" onClick={() => setDefCornerImg('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md">✕</button>
                    <img src={defCornerImg} alt="Preview" className="h-32 object-cover rounded border border-slate-700 shadow-sm" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1.5">Pontos Fortes da Equipa</label>
              <textarea name="strengths" defaultValue={current?.strengths} rows={4} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none custom-scrollbar" placeholder="Velocidade nas alas, jogo aéreo..."></textarea>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-red-400 mb-1.5">Pontos Fracos a Explorar</label>
              <textarea name="weaknesses" defaultValue={current?.weaknesses} rows={4} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none custom-scrollbar" placeholder="Lentos na transição defensiva, espaço entre linhas..."></textarea>
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Jogadores a Ter em Conta (Perigosos)</label>
              <textarea name="strongPlayers" defaultValue={current?.strongPlayers} rows={3} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none custom-scrollbar" placeholder="Nº 10 - Forte no 1 para 1 e visão de jogo..."></textarea>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Jogadores a Explorar (Debilidades)</label>
              <textarea name="weakPlayers" defaultValue={current?.weakPlayers} rows={3} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none custom-scrollbar" placeholder="Central esquerdo com má qualidade de passe..."></textarea>
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Observações Finais</label>
            <textarea name="observations" defaultValue={current?.observations} rows={3} className="w-full bg-[#0f1523] border border-slate-700/80 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none custom-scrollbar" placeholder="Anotações gerais extras..."></textarea>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 rounded-lg shadow-md transition-colors text-sm mt-4">
            {current ? 'Guardar Relatório de Scouting' : 'Criar Nova Observação'}
          </button>
        </form>
      </div>
    </div>
  );
}