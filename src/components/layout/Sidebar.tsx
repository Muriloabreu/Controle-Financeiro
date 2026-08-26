import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Wallet, 
  Tags, 
  CreditCard, 
  Target, 
  PieChart, 
  Sliders,
  Settings,
  FolderDown,
  Sparkles
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'transactions' 
  | 'accounts' 
  | 'cards' 
  | 'budgets' 
  | 'goals' 
  | 'reports' 
  | 'categories' 
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const menuItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as NavTab, label: 'Lançamentos', icon: ArrowLeftRight },
    { id: 'accounts' as NavTab, label: 'Minhas Contas', icon: Wallet },
    { id: 'cards' as NavTab, label: 'Cartões & Faturas', icon: CreditCard },
    { id: 'budgets' as NavTab, label: 'Orçamentos', icon: Sliders },
    { id: 'goals' as NavTab, label: 'Metas', icon: Target },
    { id: 'reports' as NavTab, label: 'Relatórios', icon: PieChart },
    { id: 'categories' as NavTab, label: 'Categorias', icon: Tags },
    { id: 'settings' as NavTab, label: 'Config / Download', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 shrink-0 min-h-[calc(100vh-61px)]">
        <div className="space-y-1 flex-1">
          <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu Principal
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                id={`menu-item-${item.id}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Phase Info Box */}
        <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-400 space-y-1.5 mt-4">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sistema 100% Completo</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Todas as fases e módulos integrados com persistência local e suporte ao Supabase.
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-1 py-1.5 flex items-center justify-around overflow-x-auto">
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-all ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="truncate max-w-[60px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
