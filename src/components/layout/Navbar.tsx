import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  LogOut,
  User
} from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatMonthYear } from '../../utils/formatters';

interface NavbarProps {
  onOpenNewTxModal: (defaultType?: 'INCOME' | 'EXPENSE') => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewTxModal, onOpenAuthModal }) => {
  const { 
    selectedMonth, 
    selectedYear, 
    goToPreviousMonth, 
    goToNextMonth, 
    goToCurrentMonth,
    isUsingSupabase 
  } = useFinance();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold text-xl">
            $
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Finanças Pro
              <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                MVP v1.0
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">Controle Financeiro Pessoal Inteligente</p>
          </div>
        </div>

        {/* Month Selector Carousel */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700/70 rounded-xl p-1 shadow-inner">
          <button 
            onClick={goToPreviousMonth}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Mês anterior"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button 
            onClick={goToCurrentMonth}
            className="px-3 py-1 text-xs font-semibold text-slate-200 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
            title="Ir para o mês atual"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formatMonthYear(selectedMonth, selectedYear)}</span>
          </button>

          <button 
            onClick={goToNextMonth}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Próximo mês"
            aria-label="Próximo mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Actions: Supabase indicator, New Transaction, User profile */}
        <div className="flex items-center gap-3">
          {/* Supabase Status Pill */}
          <button 
            onClick={onOpenAuthModal}
            className="hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors text-slate-300"
            title={isUsingSupabase ? "Conectado ao Supabase PostgreSQL" : "Configurar conexão com o Supabase"}
          >
            <Database className={`w-3.5 h-3.5 ${isUsingSupabase ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="font-medium text-[11px]">
              {isUsingSupabase ? 'Supabase Conectado' : 'Supabase não configurado'}
            </span>
          </button>

          {/* Quick Add Button */}
          <button 
            onClick={() => onOpenNewTxModal()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95"
            id="btn-novo-lancamento"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Novo Lançamento</span>
            <span className="sm:hidden">Novo</span>
          </button>

          {/* User Profile / Logout */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300 border border-slate-600">
                {user.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                title="Sair da conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuthModal}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Entrar</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
