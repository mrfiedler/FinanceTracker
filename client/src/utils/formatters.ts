export function formatCurrency(amount: number | string, currency: string = 'USD'): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
}

export function formatPercentage(value: number): string {
  const roundedValue = Math.round(value * 100) / 100;
  return `${roundedValue}%`;
}