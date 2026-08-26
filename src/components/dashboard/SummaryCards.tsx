import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Clock, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { formatCurrency } from '../../utils/formatters';

export const SummaryCards: React.FC = () => {
  const { summary } = useFinance();

  const isNetPositive = summary.net_result >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Saldo Geral Atual */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Saldo Atual Total</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {formatCurrency(summary.current_balance)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            Soma de todas as contas ativas
          </p>
        </div>
      </div>

      {/* 2. Total Receitas do Mês */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Receitas do Mês</span>
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl lg:text-3xl font-extrabold text-teal-400 tracking-tight flex items-center gap-1">
            {formatCurrency(summary.total_income)}
          </p>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Realizado</span>
            {summary.pending_income > 0 && (
              <span className="text-amber-400/90 font-medium">
                +{formatCurrency(summary.pending_income)} a receber
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Total Despesas do Mês */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Despesas do Mês</span>
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl lg:text-3xl font-extrabold text-rose-400 tracking-tight">
            {formatCurrency(summary.total_expense)}
          </p>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Pago</span>
            {summary.pending_expense > 0 && (
              <span className="text-amber-400/90 font-medium">
                {formatCurrency(summary.pending_expense)} a pagar
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Resultado Mensal (Balanço) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Resultado do Mês</span>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
            isNetPositive 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className={`text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-1 ${
            isNetPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {isNetPositive ? '+' : ''}{formatCurrency(summary.net_result)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            {isNetPositive ? 'Economia positiva acumulada' : 'Atenção: despesas superam receitas'}
          </p>
        </div>
      </div>

    </div>
  );
};
