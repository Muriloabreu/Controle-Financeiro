import React, { useState } from 'react';
import {
  Tags,
  Plus,
  Trash2,
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  Tag,
  Pencil,
  Loader2,
} from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { Category } from '../types';

type CategoryType = 'EXPENSE' | 'INCOME';

export const Categories: React.FC = () => {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);
  const [name, setName] = useState('');
  const [type, setType] =
    useState<CategoryType>('EXPENSE');
  const [color, setColor] = useState('#EF4444');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const expenseCategories = categories.filter(
    category => category.type === 'EXPENSE'
  );

  const incomeCategories = categories.filter(
    category => category.type === 'INCOME'
  );

  const resetForm = () => {
    setEditingCategory(null);
    setName('');
    setType('EXPENSE');
    setColor('#EF4444');
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    resetForm();
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    if (category.is_default || !category.user_id) {
      return;
    }

    setEditingCategory(category);
    setName(category.name);
    setType(category.type);
    setColor(category.color);
    setIsModalOpen(true);
  };

  const handleTypeChange = (nextType: CategoryType) => {
    setType(nextType);

    // Ao editar, preservamos a cor escolhida pelo usuário.
    if (!editingCategory) {
      setColor(
        nextType === 'EXPENSE'
          ? '#EF4444'
          : '#10B981'
      );
    }
  };

  const handleSave = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!normalizedName || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      if (editingCategory) {
        await updateCategory(
          editingCategory.id,
          {
            name: normalizedName,
            type,
            color,
            icon: editingCategory.icon || 'tag',
          }
        );
      } else {
        await addCategory({
          name: normalizedName,
          type,
          color,
          icon: 'tag',
          is_default: false,
        });
      }

      setIsModalOpen(false);
      resetForm();
    } catch {
      // O FinanceContext já apresenta a mensagem de erro.
      // Mantemos a modal aberta para o usuário corrigir.
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (
    category: Category
  ) => {
    if (
      category.is_default ||
      !category.user_id ||
      deletingId
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Excluir a categoria "${category.name}"?\n\n` +
      'A exclusão só será permitida se ela não possuir lançamentos vinculados.'
    );

    if (!confirmed) return;

    setDeletingId(category.id);

    try {
      await deleteCategory(category.id);
    } catch {
      // O FinanceContext já apresenta a mensagem de erro.
    } finally {
      setDeletingId(null);
    }
  };

  const renderCategoryCard = (
    category: Category
  ) => {
    const canManage =
      !category.is_default &&
      Boolean(category.user_id);

    const isDeleting =
      deletingId === category.id;

    return (
      <div
        key={category.id}
        className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
            style={{
              backgroundColor: category.color,
            }}
          >
            <Tag className="w-3.5 h-3.5" />
          </div>

          <div className="min-w-0">
            <span className="block text-xs font-bold text-white truncate">
              {category.name}
            </span>

            {category.is_default && (
              <span className="text-[10px] text-slate-500">
                Categoria padrão
              </span>
            )}
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() =>
                openEditModal(category)
              }
              disabled={Boolean(deletingId)}
              className="p-1.5 text-slate-500 hover:text-sky-400 disabled:opacity-40 transition-colors"
              title="Editar categoria"
              aria-label={`Editar ${category.name}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() =>
                handleDelete(category)
              }
              disabled={Boolean(deletingId)}
              className="p-1.5 text-slate-500 hover:text-rose-400 disabled:opacity-40 transition-colors"
              title="Excluir categoria"
              aria-label={`Excluir ${category.name}`}
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">
            Categorias Financeiras
          </h2>
          <p className="text-xs text-slate-400">
            Categorias padrão ficam protegidas. Você pode criar e gerenciar suas próprias categorias.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nova Categoria</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <ArrowDownCircle className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-bold text-white">
            Categorias de Despesas ({expenseCategories.length})
          </h3>
        </div>

        {expenseCategories.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Nenhuma categoria de despesa disponível.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {expenseCategories.map(renderCategoryCard)}
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <ArrowUpCircle className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-bold text-white">
            Categorias de Receitas ({incomeCategories.length})
          </h3>
        </div>

        {incomeCategories.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Nenhuma categoria de receita disponível.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {incomeCategories.map(renderCategoryCard)}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Tags className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white">
                  {editingCategory
                    ? 'Editar Categoria'
                    : 'Criar Nova Categoria'}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="text-slate-400 hover:text-white disabled:opacity-40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Tipo da Categoria
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() =>
                      handleTypeChange('EXPENSE')
                    }
                    className={`py-2 rounded-lg font-semibold border ${
                      type === 'EXPENSE'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : 'text-slate-400 border-slate-800'
                    }`}
                  >
                    Despesa
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() =>
                      handleTypeChange('INCOME')
                    }
                    className={`py-2 rounded-lg font-semibold border ${
                      type === 'INCOME'
                        ? 'bg-teal-500/20 text-teal-400 border-teal-500/40'
                        : 'text-slate-400 border-slate-800'
                    }`}
                  >
                    Receita
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nome da Categoria *
                </label>

                <input
                  type="text"
                  required
                  maxLength={80}
                  disabled={isSaving}
                  placeholder="Ex: Pets, Cursos, Academia..."
                  value={name}
                  onChange={event =>
                    setName(event.target.value)
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Cor da Categoria
                </label>

                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    '#EF4444',
                    '#F97316',
                    '#EAB308',
                    '#10B981',
                    '#06B6D4',
                    '#3B82F6',
                    '#8B5CF6',
                    '#EC4899',
                    '#64748B',
                  ].map(optionColor => (
                    <button
                      key={optionColor}
                      type="button"
                      disabled={isSaving}
                      onClick={() =>
                        setColor(optionColor)
                      }
                      className={`w-7 h-7 rounded-full border-2 transition-transform disabled:opacity-50 ${
                        color === optionColor
                          ? 'scale-125 border-white'
                          : 'border-transparent'
                      }`}
                      style={{
                        backgroundColor: optionColor,
                      }}
                      aria-label={`Selecionar cor ${optionColor}`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={
                    isSaving ||
                    !name.trim()
                  }
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {isSaving && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}

                  {editingCategory
                    ? 'Salvar Alterações'
                    : 'Salvar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
