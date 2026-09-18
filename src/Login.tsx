import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string, pass: string) => void;
  error?: string;
}

export default function Login({ onLogin, error }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCookies, setShowCookies] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1121] font-sans relative px-4">
      <div className="w-full max-w-[420px] bg-[#151c2c] rounded-2xl p-8 border border-slate-800 flex flex-col items-center shadow-2xl relative z-10">
        <div className="bg-black w-32 h-32 rounded-3xl flex flex-col items-center justify-center mb-8 shadow-lg">
          <div className="flex text-white font-black text-5xl tracking-tighter">
            SP<span className="text-blue-500">.</span>
          </div>
          <div className="text-[9px] text-white tracking-[0.2em] mt-2 uppercase">
            ScoutPro App
          </div>
        </div>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="w-full">
            <label className="block text-xs font-bold text-slate-300 mb-2 text-left">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg
                  width="20"
                  height="20"
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.53 4.389a2 2 0 001.94 0L20 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-11 pr-3 py-3 bg-[#f8fafc] text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm transition-all"
                placeholder="o.teu.email@scoutpro.pt"
              />
            </div>
          </div>

          <div className="w-full">
            <label className="block text-xs font-bold text-slate-300 mb-2 text-left">
              Palavra-passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg
                  width="20"
                  height="20"
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  ></path>
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-11 py-3 bg-[#f8fafc] text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-blue-500 cursor-pointer"
              >
                <svg
                  width="20"
                  height="20"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-3.5 rounded-xl font-bold text-sm transition-colors mt-2"
          >
            Entrar na Plataforma
          </button>
        </form>
      </div>

      {showCookies && (
        <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl bg-[#1e293b] border-l-4 border-[#3b82f6] rounded-xl p-5 flex flex-col md:flex-row gap-5 items-start md:items-center shadow-2xl z-50">
          <div className="flex items-start gap-4 flex-1">
            <div className="mt-0.5 text-[#3b82f6]">
              <svg
                width="24"
                height="24"
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Valorizamos a tua privacidade
              </h4>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Utilizamos cookies estritamente necessários para o funcionamento
                seguro desta plataforma.
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0 justify-end">
            <button
              onClick={() => setShowCookies(false)}
              className="px-4 py-2.5 bg-slate-600 hover:bg-slate-500 text-white text-xs font-bold rounded-lg whitespace-nowrap"
            >
              Apenas Essenciais
            </button>
            <button
              onClick={() => setShowCookies(false)}
              className="px-4 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-lg whitespace-nowrap"
            >
              Aceitar Todos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
