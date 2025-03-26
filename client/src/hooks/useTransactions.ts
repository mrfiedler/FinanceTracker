import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@/lib/types";

export function useTransactions() {
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  
  const { data, isLoading, error } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  return {
    transactions: data,
    isLoading,
    error,
    showAddTransactionModal,
    setShowAddTransactionModal,
  };
}
