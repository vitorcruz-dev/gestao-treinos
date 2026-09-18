import React, { useState } from 'react';
import { Player } from './types';

interface PlayersModuleProps {
  players: Player[];
  onAddPlayer: (player: Player) => void;
}

export default function PlayersModule({ players, onAddPlayer }: PlayersModuleProps) {
  const [photoData, setPhotoData] = useState<string>('');
  
  // Novos estados para controlar a data e a idade automática
  const [birthDate, setBirthDate] = useState('');
  const [calculatedAge, setCalculatedAge] = useState('');

  // Função que calcula a idade exata sempre que a data muda
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateVal = e.target.value;
    setBirthDate(dateVal);

    if (dateVal) {
      const dob = new Date(dateVal);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      
      // Se ainda não fez anos este ano, subtrai 1 à idade
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      setCalculatedAge(age.toString());
    } else {
      setCalculatedAge('');
    }
  };

  // Converte a imagem carregada para um formato legível pelo navegador (Base64)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      age: formData.get('age') as string,
      position: formData.get('position') as any,
      preferredFoot: formData.get('preferredFoot') as any,
      birthDate: formData.get('birthDate') as string,
      notes: formData.get('notes') as string,
      photoUrl: photoData,
    };

    onAddPlayer(newPlayer);
    
    // Limpar o formulário após guardar
    e.currentTarget.reset();
    setPhotoData('');
    setBirthDate('');
    setCalculatedAge('');
    alert('Atleta adicionado com sucesso!');
  };

  return (
    <div className="p-4 bg-white rounded shadow text-slate-900">
      <h2 className="text-xl font-bold mb-4 border-b pb-2 text-orange-800">Gestão do Plantel</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-8 bg-orange-50 p-4 rounded border border-orange-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium">Nome do Atleta</label>
              <input type="text" name="name" required className="w-full mt-1 p-2 border rounded bg-white" />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Data de Nascimento</label>
              <input 
                type="date" 
                name="birthDate" 
                required 
                value={birthDate}
                onChange={handleDateChange}
                className="w-full mt-1 p-2 border rounded bg-white" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Idade (Automática)</label>
              <input 
                type="number" 
                name="age" 
                required 
                value={calculatedAge}
                readOnly
                className="w-full mt-1 p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed font-bold" 
                placeholder="Calculada..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Posição</label>
              <select name="position" required className="w-full mt-1 p-2 border rounded bg-white">
                <option value="GR">Guarda-Redes (GR)</option>
                <option value="DEF">Defesa (DEF)</option>
                <option value="MED">Médio (MED)</option>
                <option value="AVA">Avançado (AVA)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium">Pé Preferencial</label>
              <select name="preferredFoot" required className="w-full mt-1 p-2 border rounded bg-white">
                <option value="Direito">Direito</option>
                <option value="Esquerdo">Esquerdo</option>
                <option value="Ambidestro">Ambidestro</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-orange-300 bg-white p-4 rounded">
            {photoData ? (
              <img src={photoData} alt="Pré-visualização" className="h-32 w-32 object-cover rounded-full mb-2 shadow" />
            ) : (
              <div className="h-32 w-32 bg-gray-100 rounded-full mb-2 flex items-center justify-center text-gray-400 text-sm shadow border border-gray-200">Sem Foto</div>
            )}
            <label className="block text-sm font-medium text-center cursor-pointer bg-orange-100 text-orange-800 px-3 py-1 rounded hover:bg-orange-200 mt-2 transition-colors">
              Carregar Foto
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium">Observações Importantes</label>
            <textarea name="notes" required className="w-full mt-1 p-2 border rounded bg-white" rows={3} placeholder="Ex: Histórico de lesões, perfil psicológico, pontos fortes de base..."></textarea>
          </div>
        </div>

        <button type="submit" className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 mt-4 font-bold shadow-lg transition-colors">
          Adicionar Atleta
        </button>
      </form>

      {/* Lista de Atletas */}
      <div>
        <h3 className="font-bold text-lg mb-4 text-slate-800">Plantel Atual ({players.length} Atletas)</h3>
        {players.length === 0 ? (
          <p className="text-gray-500 italic bg-gray-50 p-4 rounded border">O plantel ainda está vazio. Adicione o primeiro atleta acima.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map(player => (
              <div key={player.id} className="p-4 border rounded bg-white shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                {player.photoUrl ? (
                  <img src={player.photoUrl} alt={player.name} className="h-24 w-24 object-cover rounded-full mb-3 border-4 border-orange-100" />
                ) : (
                  <div className="h-24 w-24 bg-gray-50 rounded-full mb-3 border-4 border-gray-100 flex items-center justify-center text-gray-400 text-xs">Sem foto</div>
                )}
                <h4 className="font-bold text-lg text-slate-800">{player.name}</h4>
                <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-bold mb-3">{player.position}</span>
                <div className="text-sm text-slate-600 w-full text-left space-y-1 mt-2 border-t pt-3">
                  <p className="flex justify-between"><strong>Idade:</strong> <span>{player.age} anos</span></p>
                  <p className="flex justify-between"><strong>Nascimento:</strong> <span>{player.birthDate}</span></p>
                  <p className="flex justify-between"><strong>Pé:</strong> <span>{player.preferredFoot}</span></p>
                  <div className="mt-3 bg-gray-50 p-2 rounded border">
                    <strong className="text-xs block text-slate-500 mb-1">Obs:</strong>
                    <p className="text-xs italic line-clamp-3">{player.notes}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}