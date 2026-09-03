import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Account, 
  Category, 
  CreditCard, 
  Invoice,
  Transaction, 
  FinancialGoal, 
  Budget, 
  RecurringTransaction,
  MonthlyFinancialSummary, 
  TransactionType,
  TransactionStatus,
  PaymentMethod
} from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { roundMoney } from '../utils/formatters';

interface FinanceContextType {
  // Estado Temporal
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;

  // Dados Principais
  accounts: Account[];
  categories: Category[];
  creditCards: CreditCard[];
  invoices: Invoice[];
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  goals: FinancialGoal[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
  summary: MonthlyFinancialSummary;
  isLoading: boolean;
  isUsingSupabase: boolean;

  // Transações
  addTransaction: (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  addInstallmentPurchase: (params: {
    description: string;
    totalAmount: number;
    installments: number;
    categoryId?: string;
    creditCardId: string;
    firstDate: string;
    notes?: string;
  }) => Promise<void>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  toggleTransactionStatus: (id: string) => Promise<void>;

  // Contas
  addAccount: (account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateAccount: (id: string, account: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  // Categorias
  addCategory: (cat: Omit<Category, 'id' | 'created_at'>) => Promise<void>;
  updateCategory: (id: string, cat: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Cartões de Crédito & Faturas
  addCreditCard: (card: Omit<CreditCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCreditCard: (id: string, card: Partial<CreditCard>) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;
  payCardInvoice: (cardId: string, month: number, year: number, accountId: string, amount: number) => Promise<void>;

  // Metas
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<FinancialGoal>) => Promise<void>;
  depositToGoal: (id: string, amount: number, accountId?: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Orçamentos
  setCategoryBudget: (categoryId: string, limit: number, month?: number, year?: number) => Promise<void>;
  deleteBudget: (budgetId: string) => Promise<void>;

  // Recorrências
  addRecurring: (rec: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteRecurring: (id: string) => Promise<void>;

  // Backup e Restauração
  exportAllDataJSON: () => string;
  importAllDataJSON: (jsonStr: string) => boolean;
  resetToDefaultData: () => void;

  // Feedback & Toasts
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const loadLocalArray = <T,>(key: string): T[] => {
  const local = localStorage.getItem(key);
  if (!local) return [];

  try {
    const parsed = JSON.parse(local);
    if (!Array.isArray(parsed)) return [];

    // Remove automaticamente registros antigos do antigo modo de demonstração.
    if (parsed.some((item) => item?.user_id === 'demo-user')) {
      localStorage.removeItem(key);
      return [];
    }

    return parsed as T[];
  } catch {
    localStorage.removeItem(key);
    return [];
  }
};


export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  const [accounts, setAccounts] = useState<Account[]>(() => loadLocalArray<Account>('fin_accounts'));

  const [categories, setCategories] = useState<Category[]>(() => loadLocalArray<Category>('fin_categories'));

  const [creditCards, setCreditCards] = useState<CreditCard[]>(() => loadLocalArray<CreditCard>('fin_credit_cards'));

  const [transactions, setTransactions] = useState<Transaction[]>(() => loadLocalArray<Transaction>('fin_transactions'));

  const [goals, setGoals] = useState<FinancialGoal[]>(() => loadLocalArray<FinancialGoal>('fin_goals'));

  const [budgets, setBudgets] = useState<Budget[]>(() => loadLocalArray<Budget>('fin_budgets'));

  const [recurring, setRecurring] = useState<RecurringTransaction[]>(() => loadLocalArray<RecurringTransaction>('fin_recurring'));

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  const clearToast = useCallback(() => setToastMessage(null), []);

  const getAuthenticatedUserId = useCallback(async (): Promise<string> => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase não está configurado.');
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error('Usuário não autenticado.');
    }

    return user.id;
  }, []);

  // Persistência local no navegador
  useEffect(() => {
    localStorage.setItem('fin_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('fin_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('fin_credit_cards', JSON.stringify(creditCards));
  }, [creditCards]);

  useEffect(() => {
    localStorage.setItem('fin_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fin_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('fin_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('fin_recurring', JSON.stringify(recurring));
  }, [recurring]);

  // Carregar do Supabase se configurado
  useEffect(() => {
    async function loadSupabaseData() {
      if (!isSupabaseConfigured || !supabase) return;
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const [accRes, catRes, cardRes, txRes, goalRes, bgRes, recRes] = await Promise.all([
          supabase.from('accounts').select('*').eq('user_id', user.id),
          supabase.from('categories').select('*').or(`user_id.eq.${user.id},user_id.is.null`),
          supabase.from('credit_cards').select('*').eq('user_id', user.id),
          supabase.from('transactions').select('*, category:categories(*), account:accounts(*)').eq('user_id', user.id),
          supabase.from('financial_goals').select('*').eq('user_id', user.id),
          supabase.from('budgets').select('*').eq('user_id', user.id),
          supabase.from('recurring_transactions').select('*').eq('user_id', user.id),
        ]);

        if (accRes.data) setAccounts(accRes.data);
        if (catRes.data) setCategories(catRes.data);
        if (cardRes.data) setCreditCards(cardRes.data);
        if (txRes.data) setTransactions(txRes.data);
        if (goalRes.data) setGoals(goalRes.data);
        if (bgRes.data) setBudgets(bgRes.data);
        if (recRes.data) setRecurring(recRes.data);
      } catch (err) {
        console.warn('Utilizando armazenamento local persistente:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSupabaseData();
  }, []);

  // Navegação de Mês
  const goToPreviousMonth = useCallback(() => {
    setSelectedMonth((prevMonth) => {
      if (prevMonth === 1) {
        setSelectedYear((prevYear) => prevYear - 1);
        return 12;
      }
      return prevMonth - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setSelectedMonth((prevMonth) => {
      if (prevMonth === 12) {
        setSelectedYear((prevYear) => prevYear + 1);
        return 1;
      }
      return prevMonth + 1;
    });
  }, []);

  const goToCurrentMonth = useCallback(() => {
    const now = new Date();
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
  }, []);

  // Filtrar transações para o mês selecionado
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (!tx.transaction_date) return false;
      const [y, m] = tx.transaction_date.split('-');
      return parseInt(y, 10) === selectedYear && parseInt(m, 10) === selectedMonth;
    }).sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  }, [transactions, selectedMonth, selectedYear]);

  // Recalcular saldos de contas
  const recalculateAccountBalances = useCallback((txList: Transaction[], baseAccounts: Account[]) => {
    return baseAccounts.map((acc) => {
      let balance = acc.initial_balance;
      txList.forEach((tx) => {
        if (tx.account_id === acc.id) {
          if (tx.type === 'INCOME' && tx.status === 'RECEIVED') {
            balance += tx.amount;
          } else if (tx.type === 'EXPENSE' && tx.status === 'PAID') {
            balance -= tx.amount;
          } else if (tx.type === 'TRANSFER' && tx.status === 'PAID') {
            balance -= tx.amount;
          }
        }
        if (tx.destination_account_id === acc.id && tx.type === 'TRANSFER' && tx.status === 'PAID') {
          balance += tx.amount;
        }
      });
      return { ...acc, current_balance: roundMoney(balance) };
    });
  }, []);

  // Faturas calculadas dinamicamente
  const invoices = useMemo<Invoice[]>(() => {
    const list: Invoice[] = [];

    creditCards.forEach((card) => {
      // Filtrar compras deste cartão no mês/ano selecionado
      const cardTransactions = transactions.filter(t => {
        if (t.credit_card_id !== card.id) return false;
        if (!t.transaction_date) return false;
        const [y, m] = t.transaction_date.split('-');
        return parseInt(y, 10) === selectedYear && parseInt(m, 10) === selectedMonth;
      });

      const total = roundMoney(cardTransactions.reduce((acc, t) => acc + (t.amount || 0), 0));
      const mm = String(selectedMonth).padStart(2, '0');
      const dd = String(card.due_day).padStart(2, '0');
      const dueDate = `${selectedYear}-${mm}-${dd}`;

      list.push({
        id: `inv-${card.id}-${selectedYear}-${selectedMonth}`,
        user_id: card.user_id,
        credit_card_id: card.id,
        month: selectedMonth,
        year: selectedYear,
        total_amount: total,
        status: total === 0 ? 'OPEN' : 'OPEN',
        due_date: dueDate,
        credit_card: card,
      });
    });

    return list;
  }, [creditCards, transactions, selectedMonth, selectedYear]);

  // Resumo Financeiro Mensal
  const summary = useMemo<MonthlyFinancialSummary>(() => {
    let total_income = 0;
    let total_expense = 0;
    let pending_income = 0;
    let pending_expense = 0;
    let overdue_expense = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    filteredTransactions.forEach((tx) => {
      const amount = tx.amount || 0;
      if (tx.type === 'INCOME') {
        if (tx.status === 'RECEIVED') {
          total_income += amount;
        } else {
          pending_income += amount;
        }
      } else if (tx.type === 'EXPENSE') {
        if (tx.status === 'PAID') {
          total_expense += amount;
        } else {
          pending_expense += amount;
          if (tx.due_date && tx.due_date < todayStr) {
            overdue_expense += amount;
          }
        }
      }
    });

    const current_balance = accounts.reduce((acc, curr) => acc + (curr.current_balance || 0), 0);
    const net_result = roundMoney(total_income - total_expense);
    const credit_card_invoices_total = invoices.reduce((acc, inv) => acc + inv.total_amount, 0);

    return {
      month: selectedMonth,
      year: selectedYear,
      total_income: roundMoney(total_income),
      total_expense: roundMoney(total_expense),
      net_result,
      current_balance: roundMoney(current_balance),
      pending_income: roundMoney(pending_income),
      pending_expense: roundMoney(pending_expense),
      overdue_expense: roundMoney(overdue_expense),
      credit_card_invoices_total: roundMoney(credit_card_invoices_total),
    };
  }, [filteredTransactions, accounts, invoices, selectedMonth, selectedYear]);

  // Ações de Transações
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const userId = await getAuthenticatedUserId();
      const { data, error } = await supabase!
        .from('transactions')
        .insert({ ...txData, user_id: userId })
        .select('*, category:categories(*), account:accounts(*), credit_card:credit_cards(*)')
        .single();

      if (error) throw error;
      if (data) {
        setTransactions(prev => [data, ...prev]);
        showToast('Lançamento registrado com sucesso!', 'success');
      }
    } catch (err: any) {
      console.error('Erro ao salvar lançamento:', err);
      showToast(err?.message || 'Não foi possível salvar o lançamento.', 'error');
      throw err;
    }
  };

  // Compras Parceladas (Ex: 12x no cartão)
  const addInstallmentPurchase = async (params: {
    description: string;
    totalAmount: number;
    installments: number;
    categoryId?: string;
    creditCardId: string;
    firstDate: string;
    notes?: string;
  }) => {
    const { description, totalAmount, installments, categoryId, creditCardId, firstDate, notes } = params;
    const installmentGroupId = 'inst-' + Date.now();
    const installmentValue = roundMoney(totalAmount / installments);

    const userId = await getAuthenticatedUserId();
    const [firstY, firstM, firstD] = firstDate.split('-').map(Number);
    const newTxs: Transaction[] = [];

    for (let i = 1; i <= installments; i++) {
      let targetMonth = firstM + (i - 1);
      let targetYear = firstY;
      while (targetMonth > 12) {
        targetMonth -= 12;
        targetYear += 1;
      }

      const dateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(firstD).padStart(2, '0')}`;

      newTxs.push({
        id: `tx-inst-${installmentGroupId}-${i}`,
        user_id: userId,
        description: `${description} (${i}/${installments})`,
        amount: i === installments ? roundMoney(totalAmount - installmentValue * (installments - 1)) : installmentValue,
        type: 'EXPENSE',
        category_id: categoryId || null,
        credit_card_id: creditCardId,
        payment_method: 'CREDIT_CARD',
        transaction_date: dateStr,
        status: 'PAID',
        notes: notes ? `${notes} (Parcela ${i} de ${installments})` : `Parcela ${i} de ${installments}`,
        installment_number: i,
        total_installments: installments,
        installment_group_id: installmentGroupId,
        created_at: new Date().toISOString(),
        category: categories.find(c => c.id === categoryId),
        credit_card: creditCards.find(c => c.id === creditCardId),
      });
    }

    setTransactions(prev => [...newTxs, ...prev]);
    showToast(`Compra parcelada em ${installments}x criada com sucesso!`, 'success');
  };

  const updateTransaction = async (id: string, txData: Partial<Transaction>) => {
    setTransactions(prev => {
      const updated = prev.map(t => {
        if (t.id === id) {
          const merged = { ...t, ...txData };
          if (txData.category_id) merged.category = categories.find(c => c.id === txData.category_id);
          if (txData.account_id) merged.account = accounts.find(a => a.id === txData.account_id);
          return merged;
        }
        return t;
      });
      setAccounts(accs => recalculateAccountBalances(updated, accs));
      return updated;
    });

    showToast('Lançamento atualizado com sucesso!', 'success');
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => {
      const updated = prev.filter(t => t.id !== id);
      setAccounts(accs => recalculateAccountBalances(updated, accs));
      return updated;
    });
    showToast('Lançamento excluído com sucesso!', 'info');
  };

  const toggleTransactionStatus = async (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    let newStatus: TransactionStatus = 'PAID';
    if (tx.type === 'INCOME') {
      newStatus = tx.status === 'RECEIVED' ? 'PENDING' : 'RECEIVED';
    } else {
      newStatus = tx.status === 'PAID' ? 'PENDING' : 'PAID';
    }

    await updateTransaction(id, { status: newStatus });
  };

  // Ações de Contas
  const addAccount = async (accountData: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const userId = await getAuthenticatedUserId();
    const newId = 'acc-' + Date.now();
    const newAcc: Account = {
      ...accountData,
      id: newId,
      user_id: userId,
      current_balance: accountData.initial_balance,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setAccounts(prev => [...prev, newAcc]);
    showToast('Conta adicionada com sucesso!', 'success');
  };

  const updateAccount = async (id: string, accountData: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...accountData } : a));
    showToast('Conta atualizada com sucesso!', 'success');
  };

  const deleteAccount = async (id: string) => {
    const hasTransactions = transactions.some(t => t.account_id === id);
    if (hasTransactions) {
      showToast('Não é possível excluir conta com transações vinculadas.', 'error');
      return;
    }
    setAccounts(prev => prev.filter(a => a.id !== id));
    showToast('Conta removida com sucesso!', 'info');
  };

  // Ações de Categorias
  const addCategory = async (catData: Omit<Category, 'id' | 'created_at'>) => {
    const newCat: Category = {
      ...catData,
      id: 'cat-' + Date.now(),
      is_default: false,
    };
    setCategories(prev => [...prev, newCat]);
    showToast('Categoria criada com sucesso!', 'success');
  };

  const updateCategory = async (id: string, catData: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...catData } : c));
    showToast('Categoria atualizada com sucesso!', 'success');
  };

  const deleteCategory = async (id: string) => {
    const hasTransactions = transactions.some(t => t.category_id === id);
    if (hasTransactions) {
      showToast('Esta categoria possui lançamentos vinculados e não pode ser excluída.', 'error');
      return;
    }
    setCategories(prev => prev.filter(c => c.id !== id));
    showToast('Categoria removida!', 'info');
  };

  // Ações de Cartões de Crédito
  const addCreditCard = async (cardData: Omit<CreditCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const userId = await getAuthenticatedUserId();
    const newId = 'card-' + Date.now();
    const newCard: CreditCard = {
      ...cardData,
      id: newId,
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    setCreditCards(prev => [...prev, newCard]);
    showToast('Cartão de crédito adicionado!', 'success');
  };

  const updateCreditCard = async (id: string, cardData: Partial<CreditCard>) => {
    setCreditCards(prev => prev.map(c => c.id === id ? { ...c, ...cardData } : c));
    showToast('Cartão de crédito atualizado!', 'success');
  };

  const deleteCreditCard = async (id: string) => {
    const hasTransactions = transactions.some(t => t.credit_card_id === id);
    if (hasTransactions) {
      showToast('Este cartão possui compras vinculadas.', 'error');
      return;
    }
    setCreditCards(prev => prev.filter(c => c.id !== id));
    showToast('Cartão removido!', 'info');
  };

  const payCardInvoice = async (cardId: string, month: number, year: number, accountId: string, amount: number) => {
    const card = creditCards.find(c => c.id === cardId);
    if (!card) return;

    await addTransaction({
      description: `Pagamento Fatura ${card.name} (${month}/${year})`,
      amount,
      type: 'EXPENSE',
      account_id: accountId,
      category_id: 'cat-exp-10',
      payment_method: 'TRANSFER',
      transaction_date: new Date().toISOString().split('T')[0],
      status: 'PAID',
      notes: `Fatura paga no valor integral de ${amount}`,
    });

    showToast(`Fatura do cartão ${card.name} paga com sucesso! Saldo debitado da conta.`, 'success');
  };

  // Metas Financeiras
  const addGoal = async (goalData: Omit<FinancialGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const userId = await getAuthenticatedUserId();
    const newGoal: FinancialGoal = {
      ...goalData,
      id: 'goal-' + Date.now(),
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    setGoals(prev => [...prev, newGoal]);
    showToast('Meta financeira criada com sucesso!', 'success');
  };

  const updateGoal = async (id: string, goalData: Partial<FinancialGoal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...goalData } : g));
    showToast('Meta atualizada!', 'success');
  };

  const depositToGoal = async (id: string, amount: number, accountId?: string) => {
    const targetGoal = goals.find(g => g.id === id);
    if (!targetGoal) return;

    const newAmount = roundMoney(targetGoal.current_amount + amount);
    const isCompleted = newAmount >= targetGoal.target_amount;

    setGoals(prev => prev.map(g => g.id === id ? { ...g, current_amount: newAmount, is_completed: isCompleted } : g));

    if (accountId) {
      await addTransaction({
        description: `Aporte na meta: ${targetGoal.title}`,
        amount,
        type: 'EXPENSE',
        account_id: accountId,
        category_id: 'cat-inc-3',
        payment_method: 'TRANSFER',
        transaction_date: new Date().toISOString().split('T')[0],
        status: 'PAID',
        notes: `Transferência destinada à meta ${targetGoal.title}`,
      });
    }

    showToast(`Aporte de R$ ${amount} realizado na meta "${targetGoal.title}"!`, 'success');
  };

  const deleteGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    showToast('Meta removida!', 'info');
  };

  // Orçamentos
  const setCategoryBudget = async (categoryId: string, limit: number, month = selectedMonth, year = selectedYear) => {
    const userId = await getAuthenticatedUserId();
    setBudgets(prev => {
      const existing = prev.find(b => b.category_id === categoryId && b.month === month && b.year === year);
      if (existing) {
        return prev.map(b => b.id === existing.id ? { ...b, amount_limit: limit } : b);
      } else {
        return [...prev, {
          id: 'bg-' + Date.now(),
          user_id: userId,
          category_id: categoryId,
          month,
          year,
          amount_limit: limit,
          category: categories.find(c => c.id === categoryId),
        }];
      }
    });
    showToast('Orçamento salvo com sucesso!', 'success');
  };

  const deleteBudget = async (budgetId: string) => {
    setBudgets(prev => prev.filter(b => b.id !== budgetId));
    showToast('Orçamento removido!', 'info');
  };

  // Recorrências
  const addRecurring = async (recData: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const userId = await getAuthenticatedUserId();
    const newRec: RecurringTransaction = {
      ...recData,
      id: 'rec-' + Date.now(),
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    setRecurring(prev => [...prev, newRec]);
    showToast('Transação recorrente agendada!', 'success');
  };

  const deleteRecurring = async (id: string) => {
    setRecurring(prev => prev.filter(r => r.id !== id));
    showToast('Recorrência removida!', 'info');
  };

  // Backup & Restauração
  const exportAllDataJSON = (): string => {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      accounts,
      categories,
      creditCards,
      transactions,
      goals,
      budgets,
      recurring,
    };
    return JSON.stringify(data, null, 2);
  };

  const importAllDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.accounts) setAccounts(parsed.accounts);
      if (parsed.categories) setCategories(parsed.categories);
      if (parsed.creditCards) setCreditCards(parsed.creditCards);
      if (parsed.transactions) setTransactions(parsed.transactions);
      if (parsed.goals) setGoals(parsed.goals);
      if (parsed.budgets) setBudgets(parsed.budgets);
      if (parsed.recurring) setRecurring(parsed.recurring);
      showToast('Dados restaurados com sucesso a partir do backup!', 'success');
      return true;
    } catch {
      showToast('Arquivo JSON de backup inválido.', 'error');
      return false;
    }
  };

  const resetToDefaultData = () => {
    setAccounts([]);
    setCategories([]);
    setCreditCards([]);
    setTransactions([]);
    setGoals([]);
    setBudgets([]);
    setRecurring([]);
    showToast('Dados locais removidos.', 'info');
  };

  const value = {
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    accounts,
    categories,
    creditCards,
    invoices,
    transactions,
    filteredTransactions,
    goals,
    budgets,
    recurring,
    summary,
    isLoading,
    isUsingSupabase: isSupabaseConfigured,
    addTransaction,
    addInstallmentPurchase,
    updateTransaction,
    deleteTransaction,
    toggleTransactionStatus,
    addAccount,
    updateAccount,
    deleteAccount,
    addCategory,
    updateCategory,
    deleteCategory,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    payCardInvoice,
    addGoal,
    updateGoal,
    depositToGoal,
    deleteGoal,
    setCategoryBudget,
    deleteBudget,
    addRecurring,
    deleteRecurring,
    exportAllDataJSON,
    importAllDataJSON,
    resetToDefaultData,
    toastMessage,
    showToast,
    clearToast,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de um FinanceProvider');
  }
  return context;
};
