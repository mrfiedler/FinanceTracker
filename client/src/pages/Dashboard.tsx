import { useState, useEffect } from "react";
import { Link } from "wouter";
import QuickActions from "@/components/dashboard/QuickActions";
import FinanceSummary from "@/components/dashboard/FinanceSummary";
import RevenueExpenseTrends from "@/components/dashboard/RevenueExpenseTrends";
import QuoteConversion from "@/components/dashboard/QuoteConversion";
import TopClients from "@/components/dashboard/TopClients";
import RecentQuotes from "@/components/dashboard/RecentQuotes";
import AddExpenseModal from "@/components/modals/AddExpenseModal";
import AddRevenueModal from "@/components/modals/AddRevenueModal";
import AddSubscriptionModal from "@/components/modals/AddSubscriptionModal";
import CreateQuoteModal from "@/components/modals/CreateQuoteModal";
import { Button } from "@/components/ui/button";
import { useModals } from "@/hooks/useModals";
import { useGamification } from "@/context/GamificationContext";
import { Download, Plus, Award } from "lucide-react";

const Dashboard = () => {
  const { 
    expenseModalOpen,
    revenueModalOpen,
    subscriptionModalOpen,
    quoteModalOpen,
    closeAllModals,
    openAddExpenseModal, 
    openAddRevenueModal, 
    openAddSubscriptionModal, 
    openCreateQuoteModal 
  } = useModals();
  
  const { addPoints, level, points } = useGamification();
  
  // Add logging to track modal state changes
  useEffect(() => {
    console.log("Dashboard modals state:", {
      expenseModalOpen,
      revenueModalOpen,
      subscriptionModalOpen,
      quoteModalOpen
    });
  }, [expenseModalOpen, revenueModalOpen, subscriptionModalOpen, quoteModalOpen]);

  // Function to handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+E - Add Expense
      if (e.altKey && e.key === 'e') {
        openAddExpenseModal();
      }
      // Alt+R - Add Revenue  
      else if (e.altKey && e.key === 'r') {
        openAddRevenueModal();
      }
      // Alt+S - Add Subscription
      else if (e.altKey && e.key === 's') {
        openAddSubscriptionModal();
      }
      // Alt+Q - Create Quote
      else if (e.altKey && e.key === 'q') {
        openCreateQuoteModal();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openAddExpenseModal, openAddRevenueModal, openAddSubscriptionModal, openCreateQuoteModal]);

  return (
    <div className="w-full h-full p-4 md:p-6 overflow-y-auto pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Link href="/achievements">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center relative group overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Award className="mr-2 h-4 w-4 text-yellow-500 group-hover:animate-pulse" />
                <span className="relative z-10">View Achievements</span>
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
              <span className="md:inline hidden">Export Report</span>
              <span className="md:hidden inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mb-6">
          <QuickActions />
        </div>
        
        {/* Finance summary */}
        <div className="mb-6">
          <FinanceSummary />
        </div>

        {/* Main dashboard grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <RevenueExpenseTrends />
          </div>
          <div className="col-span-1">
            <QuoteConversion />
          </div>
        </div>

        {/* Bottom dashboard grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="col-span-1 lg:col-span-1">
            <TopClients />
          </div>
          <div className="col-span-1 md:col-span-2">
            <RecentQuotes />
          </div>
        </div>

        {/* Fixed action button for mobile */}
        <div className="md:hidden fixed bottom-4 right-4 z-10">
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white"
            onClick={openAddRevenueModal}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Modals */}
        <AddExpenseModal isOpen={expenseModalOpen} onClose={closeAllModals} />
        <AddRevenueModal isOpen={revenueModalOpen} onClose={closeAllModals} />
        <AddSubscriptionModal isOpen={subscriptionModalOpen} onClose={closeAllModals} />
        <CreateQuoteModal isOpen={quoteModalOpen} onClose={closeAllModals} />
      </div>
    </div>
  );
};

export default Dashboard;