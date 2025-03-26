import { useState, useCallback } from 'react';

export function useModals() {
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);

  const closeAllModals = useCallback(() => {
    setExpenseModalOpen(false);
    setRevenueModalOpen(false);
    setSubscriptionModalOpen(false);
    setQuoteModalOpen(false);
    setClientModalOpen(false);
    setContractModalOpen(false);
  }, []);

  // Enhanced implementation to ensure consistent modal behavior across all pages
  const openAddExpenseModal = useCallback(() => {
    console.log('Opening expense modal');
    closeAllModals();
    setExpenseModalOpen(true);
  }, [closeAllModals]);

  const openAddRevenueModal = useCallback(() => {
    console.log('Opening revenue modal');
    closeAllModals();
    setRevenueModalOpen(true);
  }, [closeAllModals]);

  const openAddSubscriptionModal = useCallback(() => {
    console.log('Opening subscription modal');
    closeAllModals();
    setSubscriptionModalOpen(true);
  }, [closeAllModals]);

  const openCreateQuoteModal = useCallback(() => {
    console.log('Opening quote modal');
    closeAllModals();
    setQuoteModalOpen(true);
  }, [closeAllModals]);

  const openAddClientModal = useCallback(() => {
    console.log('Opening client modal');
    closeAllModals();
    setClientModalOpen(true);
  }, [closeAllModals]);

  const openAddContractModal = useCallback(() => {
    console.log('Opening contract modal');
    closeAllModals();
    setContractModalOpen(true);
  }, [closeAllModals]);

  return {
    // Modal states
    expenseModalOpen,
    revenueModalOpen,
    subscriptionModalOpen,
    quoteModalOpen,
    clientModalOpen,
    contractModalOpen,
    
    // Modal setters (in case direct access is needed)
    setExpenseModalOpen,
    setRevenueModalOpen,
    setSubscriptionModalOpen,
    setQuoteModalOpen,
    setClientModalOpen,
    setContractModalOpen,
    
    // Control functions
    closeAllModals,
    openAddExpenseModal,
    openAddRevenueModal,
    openAddSubscriptionModal,
    openCreateQuoteModal,
    openAddClientModal,
    openAddContractModal
  };
}
