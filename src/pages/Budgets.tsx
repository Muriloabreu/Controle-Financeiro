import React, { useState } from 'react';
import { 
  PieChart, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Tag, 
  Sliders,
  DollarSign 
} from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { formatCurrency, formatMonthYear } from '../utils/formatters';

export const Budgets: React.FC = () => {
  const { 
    budgets, 
    categories, 
    filteredTransactions, 
    selectedMonth, 
    selectedYear, 
    setCategoryBudget, 
    deleteBudget 
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');

  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');

  // Calcular quanto foi gasto por categoria neste mês
  const categorySpentMap = React.useMemo(() => {
    const map = new Map<string, number>();
    filteredTransactions
      .filter(t => t.type === 'EXPENSE' && (t.status === 'PAID' || t.status === 'PENDING'))
      .forEach(t => {
        if (t.category_id) {
          map.set(t.category_id, (map.get(t.category_id) || 0) + t.amount);
        }
      });
    return map;
  }, [filteredTransactions]);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(limitAmount.replace(',', '.')) || 0;
    if (!selectedCatId || limit <= 0) return;

    await setCategoryBudget(selectedCatId, limit, selectedMonth, selectedYear);
    setSelectedCatId('');
    setLimitAmount('');
    setIsModalOpen(false);
  };

  const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.amount_limit, 0);
  const totalBudgetSpent = budgets.reduce((acc, b) => acc + (categorySpentMap.get(b.category_id) || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">Orçamento Mensal por Categoria</h2>
          <p className="text-xs text-slate-400">
            Defina limites de gastos para {formatMonthYear(selectedMonth, selectedYear)} e receba alertas automáticos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block pr-3 border-r border-slate-800">
            <p className="text-[11px] text-slate-400">Teto Planejado vs Gasto</p>
            <p className="text-sm font-extrabold text-white">
              {formatCurrency(totalBudgetSpent)} / <span className="text-emerald-400">{formatCurrency(totalBudgetLimit)}</span>
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Definir Limite</span>
          </button>
        </div>
      </div>

      {/* Grid de Orçamentos */}
      {budgets.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Sliders className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <h3 className="font-bold text-white text-base">Nenhum orçamento configurado para este mês</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Defina limites para categorias como Alimentação, Transporte e Lazer para evitar gastos excessivos.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
          >
            + Definir Primeiro Orçamento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const cat = categories.find(c => c.id === b.category_id);
            const spent = categorySpentMap.get(b.category_id) || 0;
            const percent = Math.min(150, Math.round((spent / b.amount_limit) * 100));
            const remaining = b.amount_limit - spent;
            const isOver = spent > b.amount_limit;
            const isWarning = percent >= 80 && !isOver;

            return (
              <div
                key={b.id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all ${
                  isOver 
                    ? 'border-rose-500/50 bg-rose-950/10' 
                    : isWarning 
                    ? 'border-amber-500/50 bg-amber-950/10' 
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ backgroundColor: cat?.color || '#EF4444' }}
                    >
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{cat?.name || 'Categoria'}</h3>
                      <p className="text-[11px] text-slate-400">Limite: {formatCurrency(b.amount_limit)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteBudget(b.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Excluir orçamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Barra de Progresso */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-400 font-medium">Gasto no Mês</span>
                    <span className={`font-extrabold text-sm ${isOver ? 'text-rose-400' : 'text-white'}`}>
                      {formatCurrency(spent)}
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className={isOver ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}>
                      {percent}% atingido
                    </span>
                    <span className="text-slate-400">
                      {isOver 
                        ? `Estourou em ${formatCurrency(Math.abs(remaining))}` 
                        : `Disponível: ${formatCurrency(remaining)}`}
                    </span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="pt-2 border-t border-slate-800/80 text-[11px]">
                  {isOver && (
                    <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Limite ultrapassado neste mês!</span>
                    </div>
                  )}
                  {isWarning && (
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Atenção: 80% do orçamento consumido.</span>
                    </div>
                  )}
                  {!isOver && !isWarning && (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Dentro do limite planejado.</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal Definir Orçamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white">Definir Orçamento de Categoria</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Categoria de Despesa *</label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Selecione uma categoria...</option>
                  {expenseCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Limite Máximo Mensal (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ex: 1000,00"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-base font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
                >
                  Salvar Orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
