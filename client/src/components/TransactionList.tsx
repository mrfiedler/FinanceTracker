import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Transaction, categoryColors } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function TransactionList() {
  const [currentFilter, setCurrentFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', currentFilter],
    queryFn: async ({ queryKey }) => {
      const type = queryKey[1];
      const response = await fetch(`/api/transactions?type=${type}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return response.json();
    }
  });
  
  const deleteTransaction = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/transactions/${id}`);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/summary'] });
      
      toast({
        variant: "default",
        title: "Success",
        description: "Transaction deleted successfully!",
        className: "bg-green-600 text-white border-green-700",
      });
      
      setTransactionToDelete(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete transaction."
      });
      setTransactionToDelete(null);
    }
  });
  
  const handleFilterClick = (filter: 'all' | 'income' | 'expense') => {
    setCurrentFilter(filter);
  };
  
  const confirmDelete = (id: number) => {
    setTransactionToDelete(id);
  };
  
  const handleDeleteConfirmed = () => {
    if (transactionToDelete !== null) {
      deleteTransaction.mutate(transactionToDelete);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric', 
      year: 'numeric'
    });
  };

  return (
    <div className="bg-[#1E1E1E] p-6 rounded-lg border border-[#333333] lg:col-span-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-xl font-semibold mb-2 md:mb-0">Recent Transactions</h2>
        
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFilterClick('all')}
            className={currentFilter === 'all' 
              ? 'bg-[#3DAFC4] text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
          >
            All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFilterClick('income')}
            className={currentFilter === 'income' 
              ? 'bg-[#F0CE8D] text-gray-900' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
          >
            Income
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFilterClick('expense')}
            className={currentFilter === 'expense' 
              ? 'bg-[#C6909A] text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
          >
            Expense
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
              <th className="py-3 px-4 font-medium">Description</th>
              <th className="py-3 px-4 font-medium">Category</th>
              <th className="py-3 px-4 font-medium">Date</th>
              <th className="py-3 px-4 font-medium text-right">Amount</th>
              <th className="py-3 px-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Skeleton loading state
              Array(5).fill(0).map((_, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="py-3 px-4"><Skeleton className="h-4 w-32 bg-gray-700" /></td>
                  <td className="py-3 px-4"><Skeleton className="h-4 w-24 bg-gray-700" /></td>
                  <td className="py-3 px-4"><Skeleton className="h-4 w-24 bg-gray-700" /></td>
                  <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-16 bg-gray-700 ml-auto" /></td>
                  <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-8 bg-gray-700 ml-auto" /></td>
                </tr>
              ))
            ) : transactions && transactions.length > 0 ? (
              transactions.map((transaction) => {
                const categoryStyle = categoryColors[transaction.category as keyof typeof categoryColors] || { bg: "bg-gray-900", text: "text-gray-300" };
                const isExpense = transaction.type === 'expense';
                const formattedAmount = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(Math.abs(transaction.amount));
                
                return (
                  <tr key={transaction.id} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="py-3 px-4">{transaction.description}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${categoryStyle.bg} ${categoryStyle.text}`}>
                        {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{formatDate(transaction.date)}</td>
                    <td className={`py-3 px-4 text-right ${isExpense ? 'text-[#C6909A]' : 'text-[#F0CE8D]'}`}>
                      {isExpense ? '-' : '+'}{formattedAmount}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button 
                            className="text-gray-400 hover:text-white"
                            onClick={() => confirmDelete(transaction.id)}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-800 text-white border-gray-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              This will permanently delete the transaction.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-[#C6909A] text-white hover:bg-[#C6909A]/90"
                              onClick={handleDeleteConfirmed}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  No transactions found. Add one to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {transactions && transactions.length > 0 && (
        <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
          <span>Showing {transactions.length} of {transactions.length} transactions</span>
          <div className="flex space-x-1">
            <button className="px-3 py-1 rounded-md bg-[#3DAFC4]/20 text-[#3DAFC4] hover:bg-[#3DAFC4]/30 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="px-3 py-1 rounded-md bg-[#3DAFC4]/20 text-[#3DAFC4] hover:bg-[#3DAFC4]/30 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
