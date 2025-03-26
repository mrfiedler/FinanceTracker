import { useQuery } from "@tanstack/react-query";

type FinancialSummary = {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  balanceChange: number;
  incomeChange: number;
  expenseChange: number;
};

export function useFinancialSummary() {
  const { data, isLoading, error } = useQuery<FinancialSummary>({
    queryKey: ["/api/overview"],
  });

  return {
    financialSummary: data,
    isLoading,
    error,
  };
}
