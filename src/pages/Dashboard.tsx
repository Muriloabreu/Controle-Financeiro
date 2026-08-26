import React from 'react';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { CategoryExpenseChart } from '../components/dashboard/CategoryExpenseChart';
import { CashflowChart } from '../components/dashboard/CashflowChart';
import { UpcomingBills } from '../components/dashboard/UpcomingBills';
import { useFinance } from '../contexts/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Tag, 
  Wallet,
  ArrowRight
} from 'lucide-react';

interface DashboardProps {
  onOpenNewTxModal: (type?: 'INCOME' | 'EXPENSE') => void;
  onNavigateToTransactions: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onOpenNewTxModal, 
  onNavigateToTransactions 
}) => {
  const { filteredTransactions, toggleTransactionStatus, deleteTransaction } = useFinance();

  const recentTransactions = filteredTransactions.slice(0, 6);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Cards */}
      <SummaryCards />

      {/* Main Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashflowChart />
        </div>
        <div>
          <CategoryExpenseChart />
        </div>
      </div>

      {/* Two Column Bottom: Próximos Vencimentos & Lançamentos Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Próximos Vencimentos */}
        <UpcomingBills onViewAllTransactions={onNavigateToTransactions} />

        {/* Lançamentos do Mês */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Últimos Lançamentos</h3>
            <button
              onClick={onNavigateToTransactions}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              <p className="font-semibold text-slate-400">Nenhum lançamento encontrado neste mês.</p>
              <button
                onClick={() => onOpenNewTxModal('EXPENSE')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-semibold text-xs border border-emerald-500/30 hover:bg-emerald-500/30"
              >
                + Cadastrar primeiro lançamento
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {recentTransactions.map((tx) => {
                const isIncome = tx.type === 'INCOME';
                const isPaid = tx.status === 'PAID' || tx.status === 'RECEIVED';

                return (
                  <div
                    key={tx.id}
                    className="p-3 bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center justify-between transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTransactionStatus(tx.id)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          isPaid 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                        title={isPaid ? "Status: Concluído" : "Status: Pendente (Clique para liquidar)"}
                      >
                        {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      </button>

                      <div>
                        <p className="font-bold text-white leading-snug">{tx.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{formatDate(tx.transaction_date)}</span>
                          {tx.category && (
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tx.category.color }}></span>
                              {tx.category.name}
                            </span>
                          )}
                          {tx.account && (
                            <span className="text-slate-500">• {tx.account.institution}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`font-extrabold ${isIncome ? 'text-teal-400' : 'text-rose-400'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
