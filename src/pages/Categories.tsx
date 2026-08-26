import React, { useState } from 'react';
import { Tags, Plus, Trash2, X, ArrowDownCircle, ArrowUpCircle, Tag } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';

export const Categories: React.FC = () => {
  const { categories, addCategory, deleteCategory } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [color, setColor] = useState('#EF4444');

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
  const incomeCategories = categories.filter((c) => c.type === 'INCOME');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addCategory({
      name: name.trim(),
      type,
      color,
      icon: 'tag',
      is_default: false,
    });

    setName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">Categorias Financeiras</h2>
          <p className="text-xs text-slate-400">
            Organize suas despesas e receitas em categorias personalizadas
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Categorias de Despesas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <ArrowDownCircle className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-bold text-white">Categorias de Despesas ({expenseCategories.length})</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {expenseCategories.map((cat) => (
            <div
              key={cat.id}
              className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{ backgroundColor: cat.color }}
                >
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white">{cat.name}</span>
              </div>

              {!cat.is_default && (
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Excluir categoria"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Categorias de Receitas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <ArrowUpCircle className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-bold text-white">Categorias de Receitas ({incomeCategories.length})</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {incomeCategories.map((cat) => (
            <div
              key={cat.id}
              className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{ backgroundColor: cat.color }}
                >
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white">{cat.name}</span>
              </div>

              {!cat.is_default && (
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Excluir categoria"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Nova Categoria */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 text-slate-100 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white">Criar Nova Categoria</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tipo da Categoria</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setType('EXPENSE'); setColor('#EF4444'); }}
                    className={`py-2 rounded-lg font-semibold border ${
                      type === 'EXPENSE' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'text-slate-400 border-slate-800'
                    }`}
                  >
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => { setType('INCOME'); setColor('#10B981'); }}
                    className={`py-2 rounded-lg font-semibold border ${
                      type === 'INCOME' ? 'bg-teal-500/20 text-teal-400 border-teal-500/40' : 'text-slate-400 border-slate-800'
                    }`}
                  >
                    Receita
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nome da Categoria *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pets, Cursos, Academia..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Cor da Categoria</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {['#EF4444', '#F97316', '#EAB308', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#64748B'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
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
                  Salvar Categoria
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
