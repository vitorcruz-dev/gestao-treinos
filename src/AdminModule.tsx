// src/AdminModule.tsx
import React, { useState } from 'react';
import { StaffMember, UserRole } from './types';

interface AdminModuleProps {
  staff: StaffMember[];
  onAddStaff: (member: StaffMember) => void;
}

export default function AdminModule({ staff, onAddStaff }: AdminModuleProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newStaff: StaffMember = {
      id: Date.now().toString(),
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
      age: formData.get('age') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      role: formData.get('role') as UserRole,
    };

    onAddStaff(newStaff);
    e.currentTarget.reset();
    alert('Membro da equipa técnica adicionado com sucesso!');
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 border-b pb-2 text-purple-800">
        Gestão da Equipa Técnica
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 mb-8 bg-purple-50 p-4 rounded border border-purple-100"
      >
        <h3 className="font-semibold text-purple-900 mb-2">
          Adicionar Novo Membro
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Nome Completo</label>
            <input
              type="text"
              name="name"
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Função</label>
            <select
              name="role"
              required
              className="w-full mt-1 p-2 border rounded"
            >
              <option value="">Selecione a função...</option>
              <option value="Treinador Adjunto">Treinador Adjunto</option>
              <option value="Treinador de Guarda Redes">
                Treinador de Guarda Redes
              </option>
              <option value="Observador">Observador</option>
              <option value="Preparador Físico">Preparador Físico</option>
            </select>
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
            <label className="block text-sm font-medium">
              Contacto Telefónico
            </label>
            <input
              type="tel"
              name="phone"
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Morada</label>
            <input
              type="text"
              name="address"
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <div className="pt-4 border-t border-purple-200 md:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-700">
                Nome de Utilizador (Login)
              </label>
              <input
                type="text"
                name="username"
                required
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700">
                Palavra-passe provisória
              </label>
              <input
                type="text"
                name="password"
                required
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 mt-4"
        >
          Criar Conta
        </button>
      </form>

      {/* Lista de Staff */}
      <div>
        <h3 className="font-bold text-lg mb-2">Equipa Técnica Atual</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staff.map((member) => (
            <div key={member.id} className="p-3 border rounded bg-gray-50">
              <div className="font-bold text-lg">{member.name}</div>
              <div className="text-purple-600 font-semibold text-sm mb-2">
                {member.role}
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Idade:</strong> {member.age} anos
                </p>
                <p>
                  <strong>Tel:</strong> {member.phone}
                </p>
                <p>
                  <strong>Morada:</strong> {member.address}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Login: {member.username}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
