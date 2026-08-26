# 💰 Controle Financeiro Pessoal (Full Stack SPA + Supabase)

Aplicação web completa, responsiva e profissional de **Controle Financeiro Pessoal**, desenvolvida com **React 19, TypeScript, Vite, Tailwind CSS, Recharts e Supabase (PostgreSQL + Auth + RLS)**.

---

## 🚀 Como Baixar o Projeto Completo

Você pode baixar todo o código-fonte deste projeto de duas formas diretas:

### 1. Download via Google AI Studio Build
1. No menu superior direito da interface do AI Studio, clique no ícone **Menu / Export (⚙️ ou ⋮)**.
2. Selecione **"Export to ZIP"** ou **"Export to GitHub"**.
3. O pacote completo com todos os arquivos, configurações, componentes e scripts SQL será exportado.

### 2. Rodando Localmente no seu Computador
Após descompactar o arquivo ZIP:

```bash
# 1. Acesse o diretório do projeto
cd controle-financeiro

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Abra seu navegador em `http://localhost:3000`.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Componentes & Ícones:** Lucide React, Motion
- **Gráficos & Visualização:** Recharts (Fluxo de Caixa, Gastos por Categoria, Evolução Anual)
- **Backend & Banco de Dados:** Supabase (PostgreSQL 15, Supabase Auth, Row Level Security)
- **Localização:** Formatação nativa brasileira (pt-BR - R$ 1.250,00, dd/mm/aaaa)

---

## 📦 Módulos e Funcionalidades Implementadas

### 🔹 1. Dashboard Executivo
- Resumo mensal dinâmico: Saldo Consolidado, Receitas, Despesas e Resultado Líquido.
- Seletor de Mês/Ano com recálculo instantâneo de saldos.
- Gráficos em rosca de despesas por categoria e comparativo de fluxo de caixa.
- Alertas de contas a vencer e atrasadas com liquidação em 1 clique.

### 🔹 2. Gestão de Lançamentos (Transações)
- Registro de Receitas, Despesas e Transferências entre contas.
- Filtros dinâmicos por tipo, categoria, conta bancária, status e busca por texto.
- Exportação dos lançamentos para formato CSV.
- Atualização e exclusão com recálculo retroativo de saldos.

### 🔹 3. Contas Bancárias & Carteiras
- Gestão de múltiplas contas (Conta Corrente, Poupança, Carteira Física, Investimentos).
- Saldo inicial, saldo atualizado em tempo real e cores personalizadas.

### 🔹 4. Cartões de Crédito, Faturas & Parcelamentos
- Cadastro de cartões com limite total, limite disponível, dia de fechamento e vencimento.
- Visualização de faturas mensais e lista de compras vinculadas.
- **Gerador de Compras Parceladas:** divide automaticamente qualquer compra em até 48x distribuindo as parcelas nos meses subsequentes.
- Liquidação de fatura com débito direto da conta bancária escolhida.

### 🔹 5. Orçamentos Mensais por Categoria
- Definição de tetos de gastos para categorias essenciais (ex: Alimentação, Lazer).
- Barras de progresso com alertas visuais automáticos aos 80% e 100%+ do limite consumido.

### 🔹 6. Metas & Objetivos Financeiros
- Acompanhamento de metas (Reserva de Emergência, Viagem, Comprar Carro).
- Aportes rápidos com débito opcional em conta bancária e barra de progresso em tempo real.

### 🔹 7. Relatórios Financeiros Anuais
- Evolução mensal anual de Receitas vs Despesas.
- Cálculo da taxa de poupança (% da renda guardada).
- Top 5 maiores despesas do ano e distribuição percentual de gastos.
- Layout otimizado para impressão / exportação em PDF.

### 🔹 8. Backup, Restauração e Segurança
- Exportação e importação completa de dados em JSON.
- Modo de demonstração local de alta performance com persistência no navegador.
- Integração transparente com Supabase via variáveis de ambiente.

---

## 🗄️ Configuração do Banco de Dados no Supabase

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. Acesse a aba **SQL Editor** no painel do Supabase.
3. Copie e cole todo o conteúdo do arquivo **`src/db/schema.sql`** e clique em **Run**.
4. Crie um arquivo `.env` na raiz do projeto com as credenciais do seu projeto:

```env
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_ANON_KEY="sua-anon-key-aqui"
```

---

## 📁 Estrutura de Arquivos

```
├── .env.example
├── package.json
├── vite.config.ts
├── README.md
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── components/
    │   ├── dashboard/
    │   ├── layout/
    │   └── transactions/
    ├── contexts/
    │   ├── AuthContext.tsx
    │   └── FinanceContext.tsx
    ├── db/
    │   └── schema.sql
    ├── pages/
    │   ├── Accounts.tsx
    │   ├── AuthModal.tsx
    │   ├── Budgets.tsx
    │   ├── Categories.tsx
    │   ├── CreditCards.tsx
    │   ├── Dashboard.tsx
    │   ├── Goals.tsx
    │   ├── Reports.tsx
    │   ├── Settings.tsx
    │   └── Transactions.tsx
    ├── services/
    │   └── supabase.ts
    ├── types/
    │   └── index.ts
    └── utils/
        ├── formatters.ts
        └── mockData.ts
```
# Controle-Financeiro
