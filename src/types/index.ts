export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export type TransactionStatus = 'PAID' | 'PENDING' | 'RECEIVED' | 'OVERDUE';

export type PaymentMethod = 'CASH' | 'PIX' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BOLETO' | 'TRANSFER' | 'OTHER';

export type AccountType = 'CHECKING' | 'SAVINGS' | 'WALLET' | 'DIGITAL' | 'INVESTMENT' | 'OTHER';

export type InvoiceStatus = 'OPEN' | 'CLOSED' | 'PAID' | 'OVERDUE';

export type FrequencyType = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  currency?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  institution: string;
  type: AccountType;
  initial_balance: number;
  current_balance: number;
  color: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  user_id?: string | null;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
  is_default: boolean;
  created_at?: string;
}

export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  bank: string;
  credit_limit: number;
  closing_day: number;
  due_day: number;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  credit_card_id: string;
  month: number;
  year: number;
  total_amount: number;
  status: InvoiceStatus;
  due_date: string;
  paid_at?: string | null;
  paid_from_account_id?: string | null;
  created_at?: string;
  updated_at?: string;
  credit_card?: CreditCard;
}

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category_id?: string | null;
  account_id?: string | null;
  destination_account_id?: string | null;
  credit_card_id?: string | null;
  invoice_id?: string | null;
  transaction_date: string; // YYYY-MM-DD
  due_date?: string | null;
  status: TransactionStatus;
  payment_method: PaymentMethod;
  notes?: string | null;
  is_recurring?: boolean;
  recurring_group_id?: string | null;
  installment_number?: number | null;
  total_installments?: number | null;
  installment_group_id?: string | null;
  created_at?: string;
  updated_at?: string;
  category?: Category;
  account?: Account;
  destination_account?: Account;
  credit_card?: CreditCard;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category_id?: string | null;
  account_id?: string | null;
  frequency: FrequencyType;
  start_date: string;
  end_date?: string | null;
  day_of_period: number;
  is_active: boolean;
  created_at?: string;
  category?: Category;
  account?: Account;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  month: number;
  year: number;
  amount_limit: number;
  created_at?: string;
  category?: Category;
  spent_amount?: number;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline?: string | null;
  icon: string;
  color: string;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MonthlyFinancialSummary {
  month: number;
  year: number;
  total_income: number;
  total_expense: number;
  net_result: number;
  current_balance: number;
  pending_income: number;
  pending_expense: number;
  overdue_expense: number;
  credit_card_invoices_total: number;
}
