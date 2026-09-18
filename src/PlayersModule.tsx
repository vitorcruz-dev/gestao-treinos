// src/PlayersModule.tsx
import React, { useState } from 'react';
import { Player } from './types';

interface PlayersModuleProps {
  players: Player[];
  onAddPlayer: (player: Player) => void;
}

export default function PlayersModule({
  players,
  onAddPlayer,
}: PlayersModuleProps) {
  const [photoData, setPhotoData] = useState<string>('');

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
    e.currentTarget.reset();
    setPhotoData('');
    alert('Atleta adicionado com sucesso!');
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 border-b pb-2 text-orange-800">
        Gestão do Plantel
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 mb-8 bg-orange-50 p-4 rounded border border-orange-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium">
                Nome do Atleta
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Data de Nascimento
              </label>
              <input
                type="date"
                name="birthDate"
                required
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Idade</label>
              <input
                type="number"
                name="age"
                required
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Posição</label>
              <select
                name="position"
                required
                className="w-full mt-1 p-2 border rounded"
              >
                <option value="GR">Guarda-Redes (GR)</option>
                <option value="DEF">Defesa (DEF)</option>
                <option value="MED">Médio (MED)</option>
                <option value="AVA">Avançado (AVA)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">
                Pé Preferencial
              </label>
              <select
                name="preferredFoot"
                required
                className="w-full mt-1 p-2 border rounded"
              >
                <option value="Direito">Direito</option>
                <option value="Esquerdo">Esquerdo</option>
                <option value="Ambidestro">Ambidestro</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-orange-300 bg-white p-4 rounded">
            {photoData ? (
              <img
                src={photoData}
                alt="Pré-visualização"
                className="h-32 w-32 object-cover rounded-full mb-2 shadow"
              />
            ) : (
              <div className="h-32 w-32 bg-gray-200 rounded-full mb-2 flex items-center justify-center text-gray-400 text-sm shadow">
                Sem Foto
              </div>
            )}
            <label className="block text-sm font-medium text-center cursor-pointer bg-orange-100 text-orange-800 px-3 py-1 rounded hover:bg-orange-200">
              Carregar Foto
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium">
              Observações Importantes
            </label>
            <textarea
              name="notes"
              required
              className="w-full mt-1 p-2 border rounded"
              rows={3}
              placeholder="Ex: Histórico de lesões, perfil psicológico, pontos fortes de base..."
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 mt-4 font-bold"
        >
          Adicionar Atleta
        </button>
      </form>

      {/* Lista de Atletas */}
      <div>
        <h3 className="font-bold text-lg mb-4">
          Plantel Atual ({players.length} Atletas)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <div
              key={player.id}
              className="p-4 border rounded bg-white shadow-sm flex flex-col items-center text-center"
            >
              {player.photoUrl ? (
                <img
                  src={player.photoUrl}
                  alt={player.name}
                  className="h-24 w-24 object-cover rounded-full mb-3 border-2 border-orange-200"
                />
              ) : (
                <div className="h-24 w-24 bg-gray-100 rounded-full mb-3 border-2 border-gray-200 flex items-center justify-center text-gray-400">
                  Sem foto
                </div>
              )}
              <h4 className="font-bold text-lg">{player.name}</h4>
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-bold mb-2">
                {player.position}
              </span>
              <div className="text-sm text-gray-600 w-full text-left space-y-1 mt-2 border-t pt-2">
                <p>
                  <strong>Idade:</strong> {player.age} anos ({player.birthDate})
                </p>
                <p>
                  <strong>Pé:</strong> {player.preferredFoot}
                </p>
                <p className="mt-2 text-xs italic text-gray-500 line-clamp-2">
                  {player.notes}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
