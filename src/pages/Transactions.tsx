import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  Calendar,
  Wallet,
  Tag,
  Download
} from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TransactionType, TransactionStatus } from '../types';

interface TransactionsPageProps {
  onOpenNewTxModal: (type?: 'INCOME' | 'EXPENSE') => void;
}

export const Transactions: React.FC<TransactionsPageProps> = ({ onOpenNewTxModal }) => {
  const { 
    filteredTransactions, 
    categories, 
    accounts, 
    deleteTransaction, 
    toggleTransactionStatus 
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Filtragem combinada
  const filteredList = useMemo(() => {
    return filteredTransactions.filter((tx) => {
      const matchSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchType = selectedType === 'ALL' || tx.type === selectedType;
      const matchCategory = selectedCategoryId === 'ALL' || tx.category_id === selectedCategoryId;
      const matchAccount = selectedAccountId === 'ALL' || tx.account_id === selectedAccountId;
      const matchStatus = selectedStatus === 'ALL' || tx.status === selectedStatus;

      return matchSearch && matchType && matchCategory && matchAccount && matchStatus;
    });
  }, [filteredTransactions, searchTerm, selectedType, selectedCategoryId, selectedAccountId, selectedStatus]);

  // Exportar CSV
  const handleExportCSV = () => {
    if (filteredList.length === 0) return;
    const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Conta', 'Valor', 'Status'];
    const rows = filteredList.map(t => [
      formatDate(t.transaction_date),
      t.type === 'INCOME' ? 'Receita' : 'Despesa',
      `"${t.description.replace(/"/g, '""')}"`,
      t.category?.name || 'Sem categoria',
      t.account?.name || 'Sem conta',
      t.amount.toFixed(2),
      t.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transacoes_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">Lançamentos Financeiros</h2>
          <p className="text-xs text-slate-400">
            Gerencie todas as suas receitas e despesas com filtros detalhados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => onOpenNewTxModal('INCOME')}
            className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Receita</span>
          </button>

          <button
            onClick={() => onOpenNewTxModal('EXPENSE')}
            className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Despesa</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Busca */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Tipo */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="INCOME">Apenas Receitas</option>
              <option value="EXPENSE">Apenas Despesas</option>
            </select>
          </div>

          {/* Categoria */}
          <div>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Conta */}
          <div>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Todas as Contas</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Todos os Status</option>
              <option value="PAID">Pago / Concluído</option>
              <option value="RECEIVED">Recebido</option>
              <option value="PENDING">Pendente</option>
            </select>
          </div>

        </div>
      </div>

      {/* Transactions List / Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        {filteredList.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <p className="text-sm font-semibold text-slate-400">Nenhum lançamento corresponde aos filtros.</p>
            <p className="mt-1">Tente ajustar os critérios de busca ou cadastre um novo lançamento.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Data</th>
                  <th className="py-3.5 px-4">Descrição</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Conta</th>
                  <th className="py-3.5 px-4 text-right">Valor</th>
                  <th className="py-3.5 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredList.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  const isPaid = tx.status === 'PAID' || tx.status === 'RECEIVED';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Status */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleTransactionStatus(tx.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                            isPaid
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                          }`}
                          title="Clique para alternar status"
                        >
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{isPaid ? (isIncome ? 'Recebido' : 'Pago') : 'Pendente'}</span>
                        </button>
                      </td>

                      {/* Data */}
                      <td className="py-3 px-4 text-slate-300 font-medium whitespace-nowrap">
                        {formatDate(tx.transaction_date)}
                      </td>

                      {/* Descrição & Notas */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-white text-xs">{tx.description}</p>
                        {tx.notes && (
                          <p className="text-[10px] text-slate-500 truncate max-w-xs">{tx.notes}</p>
                        )}
                      </td>

                      {/* Categoria */}
                      <td className="py-3 px-4">
                        {tx.category ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] border border-slate-700/60">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.category.color }}></span>
                            <span>{tx.category.name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* Conta */}
                      <td className="py-3 px-4 text-slate-300">
                        {tx.account ? (
                          <span className="text-slate-300 font-medium">{tx.account.name}</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* Valor */}
                      <td className="py-3 px-4 text-right font-extrabold whitespace-nowrap">
                        <span className={isIncome ? 'text-teal-400' : 'text-rose-400'}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Excluir lançamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
