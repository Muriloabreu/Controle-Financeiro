import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  X, 
  ShieldCheck, 
  Plane, 
  Car, 
  Home, 
  GraduationCap, 
  TrendingUp,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export const Goals: React.FC = () => {
  const { goals, accounts, addGoal, depositToGoal, deleteGoal } = useFinance();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');

  // Novo Objetivo
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('#10B981');
  const [icon, setIcon] = useState('ShieldCheck');

  // Aporte
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount.replace(',', '.')) || 0;
    const current = parseFloat(initialAmount.replace(',', '.')) || 0;
    if (!title.trim() || target <= 0) return;

    await addGoal({
      title: title.trim(),
      target_amount: target,
      current_amount: current,
      deadline: deadline || null,
      color,
      icon,
      is_completed: current >= target,
    });

    setTitle('');
    setTargetAmount('');
    setInitialAmount('');
    setDeadline('');
    setIsGoalModalOpen(false);
  };

  const handleConfirmDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount.replace(',', '.')) || 0;
    if (amount <= 0 || !selectedGoalId) return;

    await depositToGoal(selectedGoalId, amount, selectedAccountId || undefined);
    setDepositAmount('');
    setIsDepositModalOpen(false);
  };

  const totalSavedInGoals = goals.reduce((acc, g) => acc + g.current_amount, 0);
  const totalTargetGoals = goals.reduce((acc, g) => acc + g.target_amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">Metas & Objetivos Financeiros</h2>
          <p className="text-xs text-slate-400">
            Acompanhe o progresso das suas reservas, viagens, compras e sonhos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block pr-3 border-r border-slate-800">
            <p className="text-[11px] text-slate-400">Total Guardado em Metas</p>
            <p className="text-sm font-extrabold text-emerald-400">{formatCurrency(totalSavedInGoals)}</p>
          </div>

          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nova Meta</span>
          </button>
        </div>
      </div>

      {/* Grid de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) || 0;
          const remaining = Math.max(0, goal.target_amount - goal.current_amount);
          const isDone = goal.is_completed || progress >= 100;

          return (
            <div
              key={goal.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md font-bold"
                    style={{ backgroundColor: goal.color || '#3B82F6' }}
                  >
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{goal.title}</h3>
                    {goal.deadline && (
                      <p className="text-[11px] text-slate-400">Prazo: {formatDate(goal.deadline)}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Excluir meta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progresso Numérico */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-400 font-medium">Guardado</span>
                  <span className="text-white font-extrabold text-base">{formatCurrency(goal.current_amount)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Objetivo: {formatCurrency(goal.target_amount)}</span>
                  <span className="font-bold text-emerald-400">{progress}%</span>
                </div>

                {/* Barra de Progresso */}
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: isDone ? '#10B981' : (goal.color || '#3B82F6')
                    }}
                  />
                </div>
              </div>

              {/* Status & Aporte */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-400">
                  {isDone ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Meta Concluída!
                    </span>
                  ) : (
                    <span>Faltam {formatCurrency(remaining)}</span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedGoalId(goal.id);
                    if (accounts.length > 0) setSelectedAccountId(accounts[0].id);
                    setIsDepositModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs border border-emerald-500/30 transition-all flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                  <span>Guardar</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal Nova Meta */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white">Criar Nova Meta Financeira</h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Título do Objetivo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome da meta financeira"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Valor Alvo (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="10000,00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Valor Já Guardado</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Prazo / Data Limite (Opcional)</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Cor</label>
                <div className="flex items-center gap-2">
                  {['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'].map((c) => (
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

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
                >
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Aporte */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white">Guardar Dinheiro na Meta</h3>
              <button onClick={() => setIsDepositModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDeposit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Valor do Aporte (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ex: 500,00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-base font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Debitar de qual conta?</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Apenas atualizar valor (sem debitar da conta)</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (Saldo: {formatCurrency(a.current_balance)})</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
