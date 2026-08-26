import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  RefreshCw, 
  Database, 
  FolderArchive, 
  CheckCircle2, 
  AlertTriangle,
  Code,
  Github,
  Key
} from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { isSupabaseConfigured } from '../services/supabase';

export const Settings: React.FC = () => {
  const { exportAllDataJSON, importAllDataJSON, resetToDefaultData, showToast } = useFinance();
  const [importJsonText, setImportJsonText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleDownloadBackup = () => {
    const jsonStr = exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_financas_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup JSON gerado e baixado com sucesso!', 'success');
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const success = importAllDataJSON(importJsonText.trim());
    if (success) {
      setImportJsonText('');
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-emerald-400" />
          <span>Configurações, Backup & Download do Projeto</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Exporte seus dados financeiros, gerencie o backend Supabase e veja como baixar o código-fonte completo
        </p>
      </div>

      {/* Como Baixar o Projeto Completo (Instruções Claras) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Como Baixar o Projeto Completo (ZIP ou GitHub)</h3>
            <p className="text-xs text-slate-400">Guia de exportação e execução local no seu computador</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs text-slate-300">
          
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Download className="w-4 h-4" />
              <span>Opção 1: Download Direto no AI Studio</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed text-slate-300">
              <li>No canto superior direito da tela do AI Studio, clique no ícone de <strong>Configurações / Menu (⋮ ou ⚙️)</strong>.</li>
              <li>Selecione a opção <strong>"Export to ZIP"</strong> ou <strong>"Export to GitHub"</strong>.</li>
              <li>O arquivo compactado contendo todos os arquivos TypeScript, React, Tailwind, SQL e dependências será baixado.</li>
            </ol>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <h4 className="font-bold text-teal-400 flex items-center gap-1.5">
              <Code className="w-4 h-4" />
              <span>Opção 2: Rodar Localmente (Node.js)</span>
            </h4>
            <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-slate-200 space-y-1 border border-slate-800">
              <p className="text-emerald-400"># 1. Descompacte e entre na pasta</p>
              <p>cd controle-financeiro</p>
              <p className="text-emerald-400 mt-1"># 2. Instale as dependências</p>
              <p>npm install</p>
              <p className="text-emerald-400 mt-1"># 3. Inicie o servidor local</p>
              <p>npm run dev</p>
            </div>
          </div>

        </div>
      </div>

      {/* Backup & Restauração de Dados */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Backup & Restauração de Dados Locais</span>
        </h3>
        <p className="text-xs text-slate-400">
          Você pode salvar uma cópia completa de todas as suas contas, transações, metas e categorias em um arquivo JSON para restaurar a qualquer momento ou transferir de navegador.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleDownloadBackup}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 stroke-[3]" />
            <span>Baixar Backup Completo (JSON)</span>
          </button>

          <button
            onClick={() => setIsImporting(!isImporting)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Restaurar Backup (JSON)</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Deseja realmente restaurar os dados de exemplo padrão?')) {
                resetToDefaultData();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs border border-rose-500/30 flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Resetar Dados para Demonstração</span>
          </button>
        </div>

        {isImporting && (
          <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Cole o conteúdo do arquivo JSON de backup aqui:
            </label>
            <textarea
              rows={4}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{"version":"1.0.0", "transactions":[...]}'
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleImport}
              className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
            >
              Confirmar e Restaurar
            </button>
          </div>
        )}
      </div>

      {/* Status do Backend Supabase */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Status do Backend Supabase</span>
        </h3>
        
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">Modo de Operação</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isSupabaseConfigured 
                ? 'Conectado diretamente ao PostgreSQL na nuvem via Supabase SDK com RLS.' 
                : 'Operando em modo local reativo de alta performance com persistência automática no navegador.'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {isSupabaseConfigured ? 'Supabase Conectado' : 'Modo Local Ativo'}
          </span>
        </div>

        <div className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
          <p>
            O script completo de criação de tabelas, relacionamentos, chaves estrangeiras, índices e políticas de Row Level Security (RLS) está salvo em <code className="bg-slate-950 px-1.5 py-0.5 rounded text-emerald-400 font-mono">src/db/schema.sql</code>.
          </p>
        </div>
      </div>

    </div>
  );
};
