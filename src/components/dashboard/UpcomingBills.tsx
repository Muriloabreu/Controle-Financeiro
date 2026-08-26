import React, { useMemo } from 'react';
import { Clock, AlertCircle, CheckCircle2, Calendar, ArrowRight } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface UpcomingBillsProps {
  onViewAllTransactions: () => void;
}

export const UpcomingBills: React.FC<UpcomingBillsProps> = ({ onViewAllTransactions }) => {
  const { filteredTransactions, toggleTransactionStatus } = useFinance();

  const upcomingAndOverdue = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    const pending = filteredTransactions.filter(
      (t) => t.type === 'EXPENSE' && t.status === 'PENDING'
    );

    return pending.sort((a, b) => {
      const dateA = a.due_date || a.transaction_date;
      const dateB = b.due_date || b.transaction_date;
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  }, [filteredTransactions]);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-white">Próximos Vencimentos</h3>
        </div>
        <button
          onClick={onViewAllTransactions}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
        >
          <span>Ver todas</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {upcomingAndOverdue.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/40 mb-2" />
          <p className="font-semibold text-slate-400">Nenhuma conta pendente para este mês!</p>
          <p className="text-[11px] mt-0.5">Todas as suas despesas do período estão quitadas.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {upcomingAndOverdue.map((tx) => {
            const targetDate = tx.due_date || tx.transaction_date;
            const isOverdue = targetDate < todayStr;
            const isToday = targetDate === todayStr;

            return (
              <div
                key={tx.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  isOverdue
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : isToday
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isOverdue ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {targetDate.split('-')[2]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-snug">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                      <span className={isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                        {isOverdue ? 'Atrasada' : isToday ? 'Vence Hoje!' : `Vence em ${formatDate(targetDate)}`}
                      </span>
                      {tx.category && (
                        <span className="text-slate-500">| {tx.category.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-400">
                    {formatCurrency(tx.amount)}
                  </span>
                  <button
                    onClick={() => toggleTransactionStatus(tx.id)}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold transition-all border border-emerald-500/30"
                    title="Marcar como Pago"
                  >
                    Pagar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
