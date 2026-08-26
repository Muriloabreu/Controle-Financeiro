/**
 * Utilitários de Formatação Brasileira (pt-BR)
 */

export const formatCurrency = (value: number | string | null | undefined): string => {
  const num = typeof value === 'string' ? parseFloat(value) : (value ?? 0);
  if (isNaN(num)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    // Trata datas no formato YYYY-MM-DD sem shift de timezone
    const [year, month, day] = dateString.split('T')[0].split('-');
    if (!year || !month || !day) return dateString;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  } catch {
    return dateString;
  }
};

export const formatMonthYear = (month: number, year: number): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${months[month - 1]} / ${year}`;
};

export const getMonthName = (month: number): string => {
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  return months[month - 1] || '';
};

export const formatPercent = (value: number): string => {
  return `${Math.round(value)}%`;
};

// Precisão de 2 casas decimais sem erros de floating point
export const roundMoney = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};
