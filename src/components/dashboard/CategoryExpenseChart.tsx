import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinance } from '../../contexts/FinanceContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const DEFAULT_COLORS = ['#EF4444', '#F97316', '#3B82F6', '#EAB308', '#6366F1', '#8B5CF6', '#10B981', '#EC4899'];

export const CategoryExpenseChart: React.FC = () => {
  const { filteredTransactions, categories } = useFinance();

  const categoryData = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'EXPENSE');
    const totalExpense = expenses.reduce((acc, t) => acc + (t.amount || 0), 0);

    if (totalExpense === 0) return [];

    const map = new Map<string, { name: string; value: number; color: string }>();

    expenses.forEach(tx => {
      const cat = categories.find(c => c.id === tx.category_id);
      const catName = cat?.name || 'Outras';
      const catColor = cat?.color || '#64748B';

      const existing = map.get(catName) || { name: catName, value: 0, color: catColor };
      existing.value += tx.amount;
      map.set(catName, existing);
    });

    return Array.from(map.values())
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        ...item,
        percent: (item.value / totalExpense) * 100,
        color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      }));
  }, [filteredTransactions, categories]);

  if (categoryData.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[300px] text-center">
        <p className="text-sm font-semibold text-slate-300">Gastos por Categoria</p>
        <p className="text-xs text-slate-500 mt-2 max-w-xs">
          Nenhuma despesa registrada para o mês selecionado. Adicione lançamentos para visualizar o gráfico.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">Gastos por Categoria</h3>
        <span className="text-xs text-slate-400">Total: {formatCurrency(categoryData.reduce((acc, c) => acc + c.value, 0))}</span>
      </div>

      <div className="h-52 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-xs shadow-xl">
                      <p className="font-bold text-white">{data.name}</p>
                      <p className="text-emerald-400 font-semibold">{formatCurrency(data.value)}</p>
                      <p className="text-slate-400">{formatPercent(data.percent)} do total</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Categories breakdown list */}
      <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto pr-1">
        {categoryData.map((cat) => (
          <div key={cat.name} className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
              <span className="text-slate-300 font-medium">{cat.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">{formatPercent(cat.percent)}</span>
              <span className="text-white font-semibold">{formatCurrency(cat.value)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
