import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction } from "@shared/schema";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export default function TransactionList({ transactions, isLoading }: TransactionListProps) {
  const formatCurrency = (amountInCents: number) => {
    const amount = amountInCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      signDisplay: 'auto',
    }).format(amount);
  };

  const formatCategory = (category: string) => {
    const categoryMap: Record<string, string> = {
      'salary': 'Salary',
      'freelance': 'Freelance',
      'food': 'Food & Dining',
      'transport': 'Transportation',
      'entertainment': 'Entertainment',
      'utilities': 'Utilities',
      'other': 'Other'
    };
    
    return categoryMap[category] || category;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-3">
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No transactions yet. Add your first one above!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <span className="text-xs text-gray-500">
                      {formatCategory(transaction.category)}
                    </span>
                  </div>
                  <span className={`font-semibold ${transaction.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
