import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import { useFinance } from '../../contexts/FinanceContext';
import { formatCurrency, getMonthName } from '../../utils/formatters';

export const CashflowChart: React.FC = () => {
  const { transactions, selectedYear } = useFinance();

  const monthlyData = useMemo(() => {
    const data = [];
    for (let m = 1; m <= 12; m++) {
      let income = 0;
      let expense = 0;

      transactions.forEach(tx => {
        if (!tx.transaction_date) return;
        const [y, monthStr] = tx.transaction_date.split('-');
        if (parseInt(y, 10) === selectedYear && parseInt(monthStr, 10) === m) {
          if (tx.type === 'INCOME' && tx.status === 'RECEIVED') {
            income += tx.amount;
          } else if (tx.type === 'EXPENSE' && tx.status === 'PAID') {
            expense += tx.amount;
          }
        }
      });

      data.push({
        month: getMonthName(m),
        monthIndex: m,
        Receitas: income,
        Despesas: expense,
      });
    }
    return data;
  }, [transactions, selectedYear]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white">Receitas x Despesas ({selectedYear})</h3>
          <p className="text-xs text-slate-400">Comparativo mensal realizado</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => `R$${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`} 
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-xs shadow-xl space-y-1">
                      <p className="font-bold text-white mb-1">{label} / {selectedYear}</p>
                      <p className="text-teal-400 font-semibold">
                        Receitas: {formatCurrency(payload[0]?.value as number)}
                      </p>
                      <p className="text-rose-400 font-semibold">
                        Despesas: {formatCurrency(payload[1]?.value as number)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
              formatter={(value) => <span className="text-slate-300">{value}</span>}
            />
            <Bar dataKey="Receitas" fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
