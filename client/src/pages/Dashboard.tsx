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
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Download, Plus, Award, FileText } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

const Dashboard = () => {
  const { toast } = useToast();
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
  
  // Query to fetch financial data for export
  const { data: financeSummary } = useQuery({ 
    queryKey: ['/api/finance/summary'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const { data: financeTransactions } = useQuery({
    queryKey: ['/api/finance/transactions'],
    staleTime: 5 * 60 * 1000,
  });
  
  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
    staleTime: 5 * 60 * 1000,
  });
  
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
  
  // Function to export financial report as CSV
  const exportFinancialReport = () => {
    try {
      if (!financeSummary || !financeTransactions) {
        toast({
          title: "Export failed",
          description: "Financial data is not available yet. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Current date for the filename
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      
      // Generate CSV content
      let csvContent = "Financial Report - Generated on " + dateStr + "\n\n";
      
      // Summary section
      csvContent += "FINANCIAL SUMMARY\n";
      csvContent += "Total Revenue," + formatCurrency(financeSummary.totalRevenue, 'USD', false) + "\n";
      csvContent += "Total Expenses," + formatCurrency(financeSummary.totalExpenses, 'USD', false) + "\n";
      csvContent += "Net Profit," + formatCurrency(financeSummary.totalRevenue - financeSummary.totalExpenses, 'USD', false) + "\n";
      csvContent += "Revenue Change," + financeSummary.revenueChange + "%\n";
      csvContent += "Expense Change," + financeSummary.expensesChange + "%\n";
      csvContent += "Profit Change," + financeSummary.profitChange + "%\n\n";
      
      // Transactions section if available
      if (financeTransactions?.transactions && financeTransactions.transactions.length > 0) {
        csvContent += "RECENT TRANSACTIONS\n";
        csvContent += "Date,Description,Category,Amount,Type,Status\n";
        
        financeTransactions.transactions.forEach((transaction: any) => {
          const status = transaction.isPaid ? "Paid" : "Pending";
          csvContent += `${transaction.date},${transaction.description},${transaction.category},${formatCurrency(transaction.amount, 'USD', false)},${transaction.type},${status}\n`;
        });
      }
      
      // Create download element
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `financial-report-${dateStr}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success notification
      toast({
        title: "Report exported successfully",
        description: "Your financial report has been downloaded as a CSV file.",
        variant: "default",
      });
      
      // Add gamification points
      addPoints(5);
      
    } catch (error) {
      console.error("Error exporting report:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your financial report.",
        variant: "destructive",
      });
    }
  };

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
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center transition-all hover:bg-blue-50 dark:hover:bg-blue-950"
              onClick={exportFinancialReport}
            >
              <Download className="mr-2 h-4 w-4 text-blue-500" />
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