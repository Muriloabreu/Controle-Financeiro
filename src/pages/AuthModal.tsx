import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, login, register, logout } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'SUPABASE_INFO'>('SUPABASE_INFO');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'LOGIN') {
      const res = await login(email, password);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Login realizado com sucesso!');
        setTimeout(onClose, 1000);
      }
    } else if (mode === 'REGISTER') {
      const res = await register(email, password, fullName);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Conta criada com sucesso! Verifique seu e-mail caso o Supabase exija confirmação.');
        setTimeout(onClose, 1500);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-100 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">
              {mode === 'SUPABASE_INFO' ? 'Conexão Supabase & Autenticação' : mode === 'LOGIN' ? 'Acessar Conta' : 'Criar Nova Conta'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setMode('SUPABASE_INFO')}
            className={`py-2 rounded-lg transition-all ${
              mode === 'SUPABASE_INFO' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Instruções Supabase
          </button>
          <button
            onClick={() => setMode('LOGIN')}
            className={`py-2 rounded-lg transition-all ${
              mode === 'LOGIN' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode('REGISTER')}
            className={`py-2 rounded-lg transition-all ${
              mode === 'REGISTER' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {/* Supabase Instructions View */}
        {mode === 'SUPABASE_INFO' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Status da Conexão:</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {isSupabaseConfigured ? '✓ Supabase Ativo' : '● Modo Demonstração Local'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                O aplicativo já vem 100% funcional com armazenamento local e dados de exemplo, e pode ser conectado ao seu Supabase PostgreSQL a qualquer momento.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs">Como configurar o Supabase:</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li>Acesse seu painel no <strong className="text-emerald-400">supabase.com</strong>.</li>
                <li>Abra o <strong>SQL Editor</strong> do seu projeto Supabase.</li>
                <li>Copie e execute o arquivo <code className="bg-slate-950 px-1 py-0.5 rounded text-emerald-400 font-mono">src/db/schema.sql</code> gerado no projeto.</li>
                <li>Copie sua <strong>Project URL</strong> e <strong>Anon Public Key</strong> em <strong className="text-slate-200">Project Settings → API</strong>.</li>
                <li>Adicione as variáveis <code className="text-emerald-400">VITE_SUPABASE_URL</code> e <code className="text-emerald-400">VITE_SUPABASE_ANON_KEY</code> nas configurações de Secrets ou no arquivo <code className="text-slate-200">.env</code>.</li>
              </ol>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
              >
                Entendi e fechar
              </button>
            </div>
          </div>
        )}

        {/* Auth Form (Login or Register) */}
        {(mode === 'LOGIN' || mode === 'REGISTER') && (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {errorMsg && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs">
                {successMsg}
              </div>
            )}

            {mode === 'REGISTER' && (
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nome Completo</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-300 mb-1">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                {mode === 'LOGIN' ? 'Entrar' : 'Criar Conta no Supabase'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
