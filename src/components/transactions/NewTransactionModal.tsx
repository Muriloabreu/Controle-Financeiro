import React, { useState } from 'react';
import { 
  X, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Calendar, 
  Wallet, 
  Tag, 
  FileText, 
  CreditCard as CreditCardIcon,
  Check
} from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { TransactionType, PaymentMethod, TransactionStatus } from '../../types';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'INCOME' | 'EXPENSE';
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'EXPENSE',
}) => {
  const { categories, accounts, addTransaction, selectedMonth, selectedYear } = useFinance();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [transactionDate, setTransactionDate] = useState(() => {
    const today = new Date();
    const mm = String(selectedMonth || today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${selectedYear || today.getFullYear()}-${mm}-${dd}`;
  });
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [isCompleted, setIsCompleted] = useState(true); // Pago ou Recebido
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!description.trim()) {
      setErrorMsg('Por favor, informe uma descrição para o lançamento.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Informe um valor monetário válido maior que zero.');
      return;
    }
    if (!accountId && accounts.length > 0) {
      setErrorMsg('Selecione uma conta bancária ou carteira.');
      return;
    }

    try {
      setIsSubmitting(true);

      const status: TransactionStatus = type === 'INCOME' 
        ? (isCompleted ? 'RECEIVED' : 'PENDING')
        : (isCompleted ? 'PAID' : 'PENDING');

      await addTransaction({
        description: description.trim(),
        amount: parsedAmount,
        type,
        category_id: categoryId || (filteredCategories[0]?.id || null),
        account_id: accountId || (accounts[0]?.id || null),
        transaction_date: transactionDate,
        due_date: dueDate || null,
        status,
        payment_method: paymentMethod,
        notes: notes.trim() || null,
      });

      // Reset & Close
      setDescription('');
      setAmount('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao salvar o lançamento financeiro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Novo Lançamento Financeiro</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Type Toggle: Despesa vs Receita */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'EXPENSE'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4 text-rose-400" />
              <span>Despesa</span>
            </button>

            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'INCOME'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
              <span>Receita</span>
            </button>
          </div>

          {/* Valor (R$) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Valor (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                id="input-valor"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Descrição do Lançamento *
            </label>
            <input
              type="text"
              required
              placeholder={type === 'EXPENSE' ? 'Descrição da despesa' : 'Descrição da receita'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              id="input-descricao"
            />
          </div>

          {/* Categoria e Conta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Categoria</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Selecione uma categoria...</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-slate-400" />
                <span>Conta / Carteira *</span>
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Selecione uma conta...</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.institution})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data da Transação e Vencimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Data do Lançamento *</span>
              </label>
              <input
                type="date"
                required
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Data de Vencimento (Opcional)</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <CreditCardIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Forma de Pagamento</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="PIX">PIX</option>
              <option value="DEBIT_CARD">Cartão de Débito</option>
              <option value="CREDIT_CARD">Cartão de Crédito</option>
              <option value="BOLETO">Boleto Bancário</option>
              <option value="TRANSFER">Transferência Bancária (TED/DOC)</option>
              <option value="CASH">Dinheiro em Espécie</option>
              <option value="OTHER">Outro</option>
            </select>
          </div>

          {/* Status Switch (Pago/Recebido) */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-200">
                {type === 'INCOME' ? 'Já foi recebido?' : 'Já foi pago?'}
              </p>
              <p className="text-[11px] text-slate-400">
                {isCompleted 
                  ? (type === 'INCOME' ? 'Valor somado ao saldo atual da conta.' : 'Valor deduzido do saldo atual da conta.') 
                  : 'Ficará como pendente e não alterará o saldo realizado.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCompleted(!isCompleted)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                isCompleted ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
            </button>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Observações (Opcional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Adicione detalhes, número de comprovante, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Lançamento'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
