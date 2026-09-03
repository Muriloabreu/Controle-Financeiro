import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Building2, 
  CreditCard, 
  DollarSign,
  Landmark
} from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { formatCurrency } from '../utils/formatters';
import { AccountType } from '../types';

export const Accounts: React.FC = () => {
  const { accounts, addAccount, deleteAccount } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [type, setType] = useState<AccountType>('CHECKING');
  const [initialBalance, setInitialBalance] = useState('');
  const [color, setColor] = useState('#10B981');

  const totalBalance = accounts.reduce((acc, a) => acc + (a.current_balance || 0), 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !institution.trim()) return;

    const parsedBalance = parseFloat(initialBalance.replace(',', '.')) || 0;

    try {
      await addAccount({
        name: name.trim(),
        institution: institution.trim(),
        type,
        initial_balance: parsedBalance,
        current_balance: parsedBalance,
        color,
        is_active: true,
      });

      setName('');
      setInstitution('');
      setInitialBalance('');
      setIsModalOpen(false);
    } catch (error) {
      // O FinanceContext já exibe a mensagem de erro.
      // Mantemos a modal aberta para o usuário corrigir ou tentar novamente.
      console.error('Falha ao cadastrar conta:', error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">Minhas Contas e Carteiras</h2>
          <p className="text-xs text-slate-400">
            Acompanhe o saldo consolidado de todas as suas contas bancárias e carteiras
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block pr-3 border-r border-slate-800">
            <p className="text-[11px] text-slate-400">Saldo Total</p>
            <p className="text-sm font-extrabold text-emerald-400">{formatCurrency(totalBalance)}</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nova Conta</span>
          </button>
        </div>
      </div>

      {/* Grid of Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md font-bold text-sm"
                  style={{ backgroundColor: acc.color || '#10B981' }}
                >
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{acc.name}</h3>
                  <p className="text-xs text-slate-400">{acc.institution} • {acc.type}</p>
                </div>
              </div>

              <button
                onClick={() => deleteAccount(acc.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                title="Excluir conta"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-end justify-between">
              <div>
                <p className="text-[11px] text-slate-400">Saldo Atual</p>
                <p className={`text-xl font-extrabold tracking-tight ${
                  acc.current_balance >= 0 ? 'text-white' : 'text-rose-400'
                }`}>
                  {formatCurrency(acc.current_balance)}
                </p>
              </div>

              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Ativa
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nova Conta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 text-slate-100 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white">Cadastrar Nova Conta</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nome da Conta *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Conta Principal, Carteira, Reserva..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Instituição Financeira *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome ou instituição da conta"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tipo de Conta</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CHECKING">Conta Corrente</option>
                    <option value="DIGITAL">Conta Digital</option>
                    <option value="SAVINGS">Poupança</option>
                    <option value="WALLET">Carteira / Dinheiro</option>
                    <option value="INVESTMENT">Investimento</option>
                    <option value="OTHER">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Saldo Inicial (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Cor do Card</label>
                <div className="flex items-center gap-2">
                  {['#10B981', '#3B82F6', '#8B5CF6', '#F97316', '#EC4899', '#6366F1'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        color === c ? 'scale-125 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
                >
                  Criar Conta
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
