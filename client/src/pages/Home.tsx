import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import BalanceSummary from "@/components/BalanceSummary";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import type { Transaction } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const addTransactionMutation = useMutation({
    mutationFn: (transactionData: { description: string; amount: number; category: string }) => {
      return apiRequest("POST", "/api/transactions", transactionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add transaction",
        variant: "destructive",
      });
    },
  });

  // Calculate totals
  const balance = transactions.reduce((sum, t) => sum + t.amount, 0) / 100;
  const income = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0) / 100;
  const expenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0) / 100;

  const handleAddTransaction = (data: { description: string; amount: number; category: string }) => {
    // Convert dollars to cents for storage
    const amountInCents = Math.round(data.amount * 100);
    
    addTransactionMutation.mutate({
      ...data,
      amount: amountInCents,
    });
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto p-4 bg-gray-100">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center">Simple Finance Tracker</h1>
      </header>

      <BalanceSummary 
        balance={balance} 
        income={income} 
        expenses={expenses} 
        isLoading={isLoading} 
      />
      
      <TransactionForm 
        onSubmit={handleAddTransaction}
        isSubmitting={addTransactionMutation.isPending}
      />
      
      <TransactionList 
        transactions={transactions} 
        isLoading={isLoading} 
      />
    </div>
  );
}
