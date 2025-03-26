import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface BalanceSummaryProps {
  balance: number;
  income: number;
  expenses: number;
  isLoading: boolean;
}

export default function BalanceSummary({ balance, income, expenses, isLoading }: BalanceSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">Your Balance</p>
          {isLoading ? (
            <Skeleton className="h-10 w-32 mx-auto mt-1" />
          ) : (
            <h2 className="text-3xl font-bold">{formatCurrency(balance)}</h2>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-md text-center">
            <p className="text-sm text-gray-500">Income</p>
            {isLoading ? (
              <Skeleton className="h-7 w-24 mx-auto mt-1" />
            ) : (
              <p className="text-lg font-semibold text-emerald-600">{formatCurrency(income)}</p>
            )}
          </div>
          <div className="bg-gray-50 p-3 rounded-md text-center">
            <p className="text-sm text-gray-500">Expenses</p>
            {isLoading ? (
              <Skeleton className="h-7 w-24 mx-auto mt-1" />
            ) : (
              <p className="text-lg font-semibold text-red-600">{formatCurrency(expenses)}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
