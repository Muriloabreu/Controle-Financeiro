import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { FinanceProvider, useFinance } from './contexts/FinanceContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Accounts } from './pages/Accounts';
import { Categories } from './pages/Categories';
import { CreditCards } from './pages/CreditCards';
import { Goals } from './pages/Goals';
import { Budgets } from './pages/Budgets';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { NewTransactionModal } from './components/transactions/NewTransactionModal';
import { AuthModal } from './pages/AuthModal';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X 
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [defaultTxType, setDefaultTxType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { toastMessage, clearToast } = useFinance();

  const handleOpenNewTx = (type: 'INCOME' | 'EXPENSE' = 'EXPENSE') => {
    setDefaultTxType(type);
    setIsNewTxModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-3 duration-200">
          <div className={`px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2.5 text-xs font-semibold ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300' 
              : toastMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-500 text-rose-300'
              : 'bg-slate-900 border-slate-700 text-slate-200'
          }`}>
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
            <span>{toastMessage.text}</span>
            <button onClick={clearToast} className="ml-2 opacity-70 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar 
        onOpenNewTxModal={handleOpenNewTx} 
        onOpenAuthModal={() => setIsAuthModalOpen(true)} 
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 md:pb-8">
        {/* Navigation Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <Dashboard 
              onOpenNewTxModal={handleOpenNewTx}
              onNavigateToTransactions={() => setCurrentTab('transactions')}
            />
          )}

          {currentTab === 'transactions' && (
            <Transactions onOpenNewTxModal={handleOpenNewTx} />
          )}

          {currentTab === 'accounts' && (
            <Accounts />
          )}

          {currentTab === 'cards' && (
            <CreditCards />
          )}

          {currentTab === 'budgets' && (
            <Budgets />
          )}

          {currentTab === 'goals' && (
            <Goals />
          )}

          {currentTab === 'reports' && (
            <Reports />
          )}

          {currentTab === 'categories' && (
            <Categories />
          )}

          {currentTab === 'settings' && (
            <Settings />
          )}
        </main>
      </div>

      {/* New Transaction Modal */}
      <NewTransactionModal 
        isOpen={isNewTxModalOpen}
        onClose={() => setIsNewTxModalOpen(false)}
        defaultType={defaultTxType}
      />

      {/* Auth & Supabase Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <MainLayout />
      </FinanceProvider>
    </AuthProvider>
  );
}
