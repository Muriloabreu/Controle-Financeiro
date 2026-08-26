import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  Award,
  Wallet,
  Tag,
  CreditCard
} from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { formatCurrency, formatPercent, getMonthName } from '../utils/formatters';

const PIE_COLORS = ['#EF4444', '#F97316', '#3B82F6', '#EAB308', '#6366F1', '#8B5CF6', '#10B981', '#EC4899'];

export const Reports: React.FC = () => {
  const { transactions, categories, accounts, selectedYear } = useFinance();
  const [reportYear, setReportYear] = useState<number>(selectedYear);

  // Filtrar transações do ano selecionado
  const yearTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (!t.transaction_date) return false;
      const [y] = t.transaction_date.split('-');
      return parseInt(y, 10) === reportYear;
    });
  }, [transactions, reportYear]);

  // Totais anuais
  const annualSummary = useMemo(() => {
    let income = 0;
    let expense = 0;

    yearTransactions.forEach(t => {
      if (t.type === 'INCOME' && t.status === 'RECEIVED') {
        income += t.amount;
      } else if (t.type === 'EXPENSE' && t.status === 'PAID') {
        expense += t.amount;
      }
    });

    const net = income - expense;
    const savingsRate = income > 0 ? (net > 0 ? (net / income) * 100 : 0) : 0;

    return {
      income,
      expense,
      net,
      savingsRate,
    };
  }, [yearTransactions]);

  // Dados mensais para o gráfico de barras
  const monthlyData = useMemo(() => {
    const data = [];
    for (let m = 1; m <= 12; m++) {
      let income = 0;
      let expense = 0;

      yearTransactions.forEach(tx => {
        const [, mStr] = tx.transaction_date.split('-');
        if (parseInt(mStr, 10) === m) {
          if (tx.type === 'INCOME' && tx.status === 'RECEIVED') income += tx.amount;
          if (tx.type === 'EXPENSE' && tx.status === 'PAID') expense += tx.amount;
        }
      });

      data.push({
        month: getMonthName(m),
        Receitas: income,
        Despesas: expense,
        Resultado: income - expense,
      });
    }
    return data;
  }, [yearTransactions]);

  // Gastos por categoria no ano
  const categoryExpenses = useMemo(() => {
    const map = new Map<string, number>();
    yearTransactions
      .filter(t => t.type === 'EXPENSE' && t.status === 'PAID')
      .forEach(t => {
        const cat = categories.find(c => c.id === t.category_id);
        const name = cat?.name || 'Outras';
        map.set(name, (map.get(name) || 0) + t.amount);
      });

    return Array.from(map.entries())
      .map(([name, value], i) => ({
        name,
        value,
        color: PIE_COLORS[i % PIE_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [yearTransactions, categories]);

  // Maiores despesas do ano
  const topExpenses = useMemo(() => {
    return yearTransactions
      .filter(t => t.type === 'EXPENSE')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [yearTransactions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">Relatórios Financeiros Anuais</h2>
          <p className="text-xs text-slate-400">
            Visão estratégica de receitas, despesas, taxa de poupança e evolução patrimonial
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <span>Ano:</span>
            <select
              value={reportYear}
              onChange={(e) => setReportYear(Number(e.target.value))}
              className="bg-transparent font-bold text-emerald-400 focus:outline-none"
            >
              <option value={2025} className="bg-slate-900">2025</option>
              <option value={2026} className="bg-slate-900">2026</option>
              <option value={2027} className="bg-slate-900">2027</option>
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas Anuais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Receita Anual Total</span>
          <p className="text-2xl font-extrabold text-teal-400 mt-2">{formatCurrency(annualSummary.income)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Total creditado no ano</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Despesa Anual Total</span>
          <p className="text-2xl font-extrabold text-rose-400 mt-2">{formatCurrency(annualSummary.expense)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Total desembolsado no ano</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Economia Líquida ({reportYear})</span>
          <p className={`text-2xl font-extrabold mt-2 ${annualSummary.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {annualSummary.net >= 0 ? '+' : ''}{formatCurrency(annualSummary.net)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Balanço do ano</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Taxa de Poupança</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">{formatPercent(annualSummary.savingsRate)}</p>
          <p className="text-[11px] text-slate-400 mt-1">% da renda guardada</p>
        </div>
      </div>

      {/* Gráfico Anual de Fluxo de Caixa */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white">Evolução Mensal Receitas x Despesas ({reportYear})</h3>
        
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs shadow-xl space-y-1">
                        <p className="font-bold text-white mb-1">{label} / {reportYear}</p>
                        <p className="text-teal-400">Receitas: {formatCurrency(payload[0]?.value as number)}</p>
                        <p className="text-rose-400">Despesas: {formatCurrency(payload[1]?.value as number)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} formatter={(val) => <span className="text-slate-300">{val}</span>} />
              <Bar dataKey="Receitas" fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Distribuição Anual & Maiores Despesas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Distribuição de Categorias no Ano */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <h3 className="text-sm font-bold text-white mb-3">Distribuição Anual de Gastos</h3>
          
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {categoryExpenses.map((cat) => {
              const total = annualSummary.expense || 1;
              const pct = (cat.value / total) * 100;

              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{cat.name}</span>
                    <span className="text-white font-bold">{formatCurrency(cat.value)} ({formatPercent(pct)})</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-rose-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Maiores Despesas do Ano */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <h3 className="text-sm font-bold text-white mb-3">Top 5 Maiores Despesas de {reportYear}</h3>

          <div className="space-y-2.5">
            {topExpenses.map((tx, idx) => (
              <div key={tx.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-extrabold flex items-center justify-center text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{tx.description}</p>
                    <p className="text-[10px] text-slate-400">{tx.transaction_date}</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-rose-400">
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
