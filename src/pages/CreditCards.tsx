import React, { useState } from 'react';
import { 
  CreditCard as CreditCardIcon, 
  Plus, 
  Trash2, 
  X, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Layers,
  AlertCircle,
  Receipt,
  ArrowRight
} from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { formatCurrency, formatDate, formatMonthYear } from '../utils/formatters';

export const CreditCards: React.FC = () => {
  const { 
    creditCards, 
    invoices, 
    accounts, 
    categories,
    selectedMonth, 
    selectedYear,
    transactions,
    addCreditCard, 
    deleteCreditCard, 
    addInstallmentPurchase,
    payCardInvoice 
  } = useFinance();

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [isPayInvoiceModalOpen, setIsPayInvoiceModalOpen] = useState(false);
  const [selectedCardForPay, setSelectedCardForPay] = useState<string>('');
  const [selectedAccountForPay, setSelectedAccountForPay] = useState<string>('');

  // Novo Cartão State
  const [cardName, setCardName] = useState('');
  const [cardBank, setCardBank] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [closingDay, setClosingDay] = useState(10);
  const [dueDay, setDueDay] = useState(17);
  const [cardColor, setCardColor] = useState('#8B5CF6');

  // Compra Parcelada State
  const [instDesc, setInstDesc] = useState('');
  const [instTotal, setInstTotal] = useState('');
  const [instCount, setInstCount] = useState(10);
  const [instCardId, setInstCardId] = useState('');
  const [instCategoryId, setInstCategoryId] = useState('');
  const [instDate, setInstDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Criar Cartão
  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(cardLimit.replace(',', '.')) || 0;
    if (!cardName || limit <= 0) return;

    await addCreditCard({
      name: cardName,
      bank: cardBank || cardName,
      credit_limit: limit,
      closing_day: Number(closingDay),
      due_day: Number(dueDay),
      color: cardColor,
    });

    setCardName('');
    setCardBank('');
    setCardLimit('');
    setIsCardModalOpen(false);
  };

  // Criar Compra Parcelada
  const handleCreateInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(instTotal.replace(',', '.')) || 0;
    if (!instDesc || total <= 0 || !instCardId) return;

    await addInstallmentPurchase({
      description: instDesc,
      totalAmount: total,
      installments: Number(instCount),
      categoryId: instCategoryId || undefined,
      creditCardId: instCardId,
      firstDate: instDate,
    });

    setInstDesc('');
    setInstTotal('');
    setIsInstallmentModalOpen(false);
  };

  // Pagar Fatura
  const handleConfirmPayInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const card = creditCards.find(c => c.id === selectedCardForPay);
    const inv = invoices.find(i => i.credit_card_id === selectedCardForPay);
    if (!card || !inv || !selectedAccountForPay) return;

    await payCardInvoice(card.id, selectedMonth, selectedYear, selectedAccountForPay, inv.total_amount);
    setIsPayInvoiceModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">Cartões de Crédito & Faturas</h2>
          <p className="text-xs text-slate-400">
            Controle de limites, faturas mensais ({formatMonthYear(selectedMonth, selectedYear)}) e compras parceladas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (creditCards.length > 0) {
                setInstCardId(creditCards[0].id);
              }
              setIsInstallmentModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-xs border border-purple-500/30 flex items-center gap-1.5 transition-all"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>+ Compra Parcelada</span>
          </button>

          <button
            onClick={() => setIsCardModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Novo Cartão</span>
          </button>
        </div>
      </div>

      {/* Cartões & Faturas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {creditCards.map((card) => {
          const inv = invoices.find((i) => i.credit_card_id === card.id);
          const currentInvoiceAmount = inv?.total_amount || 0;
          const availableLimit = Math.max(0, card.credit_limit - currentInvoiceAmount);
          const usedPercent = Math.min(100, (currentInvoiceAmount / card.credit_limit) * 100);

          // Transações deste cartão neste mês
          const cardTransactions = transactions.filter(t => {
            if (t.credit_card_id !== card.id) return false;
            if (!t.transaction_date) return false;
            const [y, m] = t.transaction_date.split('-');
            return parseInt(y, 10) === selectedYear && parseInt(m, 10) === selectedMonth;
          });

          return (
            <div
              key={card.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              {/* Visual Card Style */}
              <div 
                className="p-5 rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[160px]"
                style={{
                  background: `linear-gradient(135deg, ${card.color || '#8B5CF6'} 0%, #0f172a 140%)`
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-white/80 uppercase tracking-widest">{card.bank}</p>
                    <h3 className="text-lg font-extrabold tracking-tight">{card.name}</h3>
                  </div>
                  <CreditCardIcon className="w-8 h-8 opacity-80" />
                </div>

                <div className="pt-4 flex items-end justify-between text-xs">
                  <div>
                    <p className="text-[10px] text-white/70">Limite Total</p>
                    <p className="font-bold text-base">{formatCurrency(card.credit_limit)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/70">Fecha dia {card.closing_day} • Vence dia {card.due_day}</p>
                    <p className="font-semibold text-[11px]">Disponível: {formatCurrency(availableLimit)}</p>
                  </div>
                </div>
              </div>

              {/* Barra de Limite */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Limite Utilizado</span>
                  <span className="text-slate-200">{usedPercent.toFixed(0)}% ({formatCurrency(currentInvoiceAmount)})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      usedPercent > 80 ? 'bg-rose-500' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>
              </div>

              {/* Fatura do Mês */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Fatura {formatMonthYear(selectedMonth, selectedYear)}</span>
                  </div>
                  <span className="text-sm font-extrabold text-rose-400">
                    {formatCurrency(currentInvoiceAmount)}
                  </span>
                </div>

                {/* Compras na Fatura */}
                {cardTransactions.length === 0 ? (
                  <p className="text-[11px] text-slate-500 py-1">Nenhuma compra lançada nesta fatura.</p>
                ) : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {cardTransactions.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-800/50">
                        <span className="text-slate-300 font-medium truncate max-w-[200px]">{tx.description}</span>
                        <span className="text-slate-200 font-bold">{formatCurrency(tx.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botão Pagar Fatura */}
                {currentInvoiceAmount > 0 && (
                  <button
                    onClick={() => {
                      setSelectedCardForPay(card.id);
                      if (accounts.length > 0) setSelectedAccountForPay(accounts[0].id);
                      setIsPayInvoiceModalOpen(true);
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pagar Fatura ({formatCurrency(currentInvoiceAmount)})</span>
                  </button>
                )}
              </div>

              {/* Excluir Cartão */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => deleteCreditCard(card.id)}
                  className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Excluir Cartão</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal Novo Cartão */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white">Cadastrar Cartão de Crédito</h3>
              <button onClick={() => setIsCardModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nome do Cartão *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do cartão"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Banco Emissor</label>
                  <input
                    type="text"
                    placeholder="Instituição financeira"
                    value={cardBank}
                    onChange={(e) => setCardBank(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Limite Total (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="5000,00"
                    value={cardLimit}
                    onChange={(e) => setCardLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Dia do Fechamento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={closingDay}
                    onChange={(e) => setClosingDay(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Dia do Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dueDay}
                    onChange={(e) => setDueDay(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Cor do Cartão</label>
                <div className="flex items-center gap-2">
                  {['#8B5CF6', '#3B82F6', '#EA580C', '#10B981', '#E11D48', '#0F172A', '#F59E0B'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCardColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        cardColor === c ? 'scale-125 border-white' : 'border-transparent'
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
                  Cadastrar Cartão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Compra Parcelada */}
      {isInstallmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Registrar Compra Parcelada</span>
              </h3>
              <button onClick={() => setIsInstallmentModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInstallment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descrição do Item *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Notebook Dell, Celular Samsung, Passagem Aérea..."
                  value={instDesc}
                  onChange={(e) => setInstDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Valor Total (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="3600,00"
                    value={instTotal}
                    onChange={(e) => setInstTotal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Número de Parcelas *</label>
                  <input
                    type="number"
                    min="2"
                    max="48"
                    required
                    value={instCount}
                    onChange={(e) => setInstCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {parseFloat(instTotal) > 0 && (
                <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-300 text-[11px]">
                  {instCount} parcelas de <strong>{formatCurrency((parseFloat(instTotal) || 0) / instCount)}</strong> geradas automaticamente nos meses subsequentes.
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Cartão de Crédito *</label>
                <select
                  value={instCardId}
                  onChange={(e) => setInstCardId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {creditCards.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.bank})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Categoria</label>
                  <select
                    value={instCategoryId}
                    onChange={(e) => setInstCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Selecione...</option>
                    {categories.filter(c => c.type === 'EXPENSE').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Data da 1ª Parcela</label>
                  <input
                    type="date"
                    required
                    value={instDate}
                    onChange={(e) => setInstDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-lg shadow-purple-500/20"
                >
                  Gerar Parcelamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pagar Fatura */}
      {isPayInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white">Liquidar Fatura do Cartão</h3>
              <button onClick={() => setIsPayInvoiceModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayInvoice} className="space-y-3 text-xs">
              <p className="text-slate-300 text-[11px]">
                Selecione de qual conta bancária será debitado o pagamento desta fatura.
              </p>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Conta para Débito *</label>
                <select
                  value={selectedAccountForPay}
                  onChange={(e) => setSelectedAccountForPay(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                >
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
                  Confirmar Pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
