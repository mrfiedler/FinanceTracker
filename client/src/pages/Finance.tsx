import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/hooks/useCurrency";
import { formatCurrency, formatDate } from "@/lib/utils";
import { bankAccounts } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter,
  Wallet,
  BanknoteIcon,
  Landmark,
  Settings,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Pencil,
  Trash2,
  MoreVertical
} from "lucide-react";
import { 
  SiChase, 
  SiBankofamerica, 
  SiWellsfargo, 
  SiPaypal, 
  SiStripe, 
  SiSquare, 
  SiVenmo 
} from "react-icons/si";
import { useModals } from "@/hooks/useModals";
import AddExpenseModal from "@/components/modals/AddExpenseModal";
import AddRevenueModal from "@/components/modals/AddRevenueModal";
import FinanceSettingsModal from "@/components/modals/FinanceSettingsModal";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format, subMonths, addMonths, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';

const Finance = () => {
  const { currency } = useCurrency();
  const [transactionType, setTransactionType] = useState("all");
  const [dateRange, setDateRange] = useState("30");
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all"); // Added state for category filter
  const [selectedAccount, setSelectedAccount] = useState("all"); // Added state for account filter
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Current month for filtering
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [optimisticUpdates, setOptimisticUpdates] = useState<{[key: string]: boolean}>({});
  
  // State for edit and delete
  const [editExpenseModalOpen, setEditExpenseModalOpen] = useState(false);
  const [editRevenueModalOpen, setEditRevenueModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);
  
  const {
    expenseModalOpen,
    revenueModalOpen,
    closeAllModals,
    openAddExpenseModal,
    openAddRevenueModal
  } = useModals();

  // Initialize the current month on component mount
  useEffect(() => {
    // Set the current month for default view
    setCurrentMonth(new Date());
    
    // Calculate start and end dates of the current month
    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(new Date());
    
    // Set the custom date range to current month
    setCustomDateStart(format(startDate, 'yyyy-MM-dd'));
    setCustomDateEnd(format(endDate, 'yyyy-MM-dd'));
    
    // Set the date range to "custom"
    setDateRange("month");
  }, []);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const previousMonth = subMonths(currentMonth, 1);
    setCurrentMonth(previousMonth);
    
    const startDate = startOfMonth(previousMonth);
    const endDate = endOfMonth(previousMonth);
    
    setCustomDateStart(format(startDate, 'yyyy-MM-dd'));
    setCustomDateEnd(format(endDate, 'yyyy-MM-dd'));
    setDateRange("month");
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    setCurrentMonth(nextMonth);
    
    const startDate = startOfMonth(nextMonth);
    const endDate = endOfMonth(nextMonth);
    
    setCustomDateStart(format(startDate, 'yyyy-MM-dd'));
    setCustomDateEnd(format(endDate, 'yyyy-MM-dd'));
    setDateRange("month");
  };

  // Function to edit a transaction
  const handleEditTransaction = (transaction: any) => {
    setCurrentTransaction(transaction);
    if (transaction.type === 'expense') {
      setEditExpenseModalOpen(true);
    } else {
      setEditRevenueModalOpen(true);
    }
  };

  // Function to delete a transaction
  const handleDeleteTransaction = async (transaction: any) => {
    if (!window.confirm(`Are you sure you want to delete this ${transaction.type}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/${transaction.type === 'expense' ? 'expenses' : 'revenues'}/${transaction.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${transaction.type}`);
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/finance/transactions']
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/finance/summary']
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/finance/trends']
      });

      toast({
        title: "Deleted successfully",
        description: `The ${transaction.type} has been deleted`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Delete failed",
        description: `Failed to delete the ${transaction.type}`,
        variant: "destructive"
      });
    }
  };

  // Function to update transaction status instantly
  const updateTransactionStatus = useCallback(async (transaction: any) => {
    // Create a unique key for this transaction
    const transactionKey = `${transaction.type}-${transaction.id}`;

    // Get the current status
    const currentStatus = transaction.isPaid;

    // Set optimistic update
    setOptimisticUpdates(prev => ({
      ...prev,
      [transactionKey]: !currentStatus
    }));

    try {
      // Make the API call
      const response = await fetch(`/api/${transaction.type === 'expense' ? 'expenses' : 'revenues'}/${transaction.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPaid: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Invalidate query to refresh data in the background
      queryClient.invalidateQueries({
        queryKey: ['/api/finance/transactions', transactionType, dateRange, searchQuery, selectedCategory, selectedAccount, customDateStart, customDateEnd]
      });

    } catch (error) {
      console.error('Error updating status:', error);

      // Revert optimistic update on error
      setOptimisticUpdates(prev => ({
        ...prev,
        [transactionKey]: currentStatus
      }));

      // Show toast message
      toast({
        title: "Update failed",
        description: "Failed to update transaction status",
        variant: "destructive"
      });
    }
  }, [transactionType, dateRange, searchQuery, selectedCategory, selectedAccount, customDateStart, customDateEnd, queryClient, toast]);

  const { data: financeData, isLoading } = useQuery({
    queryKey: ['/api/finance/transactions', transactionType, dateRange, searchQuery, selectedCategory, selectedAccount, customDateStart, customDateEnd],
    queryFn: async () => {
      let url = `/api/finance/transactions?dateRange=${dateRange}&transactionType=${transactionType}&category=${selectedCategory}&account=${selectedAccount}`;
      
      // If using month filtering, add custom date parameters
      if (dateRange === "month" && customDateStart && customDateEnd) {
        url += `&startDate=${customDateStart}&endDate=${customDateEnd}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return response.json();
    }
  });

  const filterTransactions = (transactions: any[]) => {
    if (!transactions) return [];

    return transactions.filter((transaction: any) => {
      // Filter by transaction type
      if (transactionType !== "all" && transaction.type !== transactionType) {
        return false;
      }

      // Filter by search query
      if (searchQuery && !transaction.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      //Filter by category
      if(selectedCategory !== "all" && transaction.category !== selectedCategory){
        return false;
      }

      //Filter by account
      if(selectedAccount !== "all" && transaction.account !== selectedAccount){
        return false;
      }

      return true;
    });
  };

  const filteredTransactions = financeData ? filterTransactions(financeData.transactions || [])
    .map((transaction: any) => ({
      ...transaction,
      status: transaction.dueDate && new Date(transaction.dueDate) < new Date() ? 'Overdue' : 'Pending',
      isPaid: transaction.isPaid || false
    }))
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];


  return (
    <main className="w-full h-full overflow-y-auto bg-background p-4 md:p-6 pb-20">
      {/* Edit Expense Modal */}
      {editExpenseModalOpen && currentTransaction && (
        <AddExpenseModal
          isOpen={editExpenseModalOpen}
          onClose={() => {
            setEditExpenseModalOpen(false);
            setCurrentTransaction(null);
          }}
          expense={currentTransaction}
          isEditing={true}
        />
      )}
      
      {/* Edit Revenue Modal */}
      {editRevenueModalOpen && currentTransaction && (
        <AddRevenueModal
          isOpen={editRevenueModalOpen}
          onClose={() => {
            setEditRevenueModalOpen(false);
            setCurrentTransaction(null);
          }}
          revenue={currentTransaction}
          isEditing={true}
        />
      )}
      
      <div className="page-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title">Finance</h1>
          <p className="page-description">
            Manage your revenues and expenses
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center shadow-sm"
          onClick={() => setSettingsModalOpen(true)}
        >
          <Settings className="h-3.5 w-3.5 mr-1.5" />
          <span>Settings</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {transactionType === "all" && (
          <>
            <Card className="overflow-hidden border-l-4 border-l-[#3DAFC4] hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription className="text-sm font-medium">Current Balance</CardDescription>
                <CardTitle className="text-2xl font-bold text-[#3DAFC4] flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-28" />
                  ) : (
                    <>
                      {formatCurrency(financeData?.netProfit || 0, currency)}
                      <span className="text-xs ml-2 text-muted-foreground">(paid transactions only)</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-[#A3E635] hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription className="text-sm font-medium">Current Month Revenue</CardDescription>
                <CardTitle className="text-2xl font-bold text-[#A3E635] flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-28" />
                  ) : (
                    <>
                      {formatCurrency(financeData?.totalRevenue || 0, currency)}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="overflow-hidden border-l-4 border-l-[#c6909a] hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription className="text-sm font-medium">Current Month Expenses</CardDescription>
                <CardTitle className="text-2xl font-bold text-[#c6909a] flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-28" />
                  ) : (
                    <>
                      {formatCurrency(financeData?.totalExpenses || 0, currency)}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-[#9F7AEA] hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription className="text-sm font-medium">Monthly Balance</CardDescription>
                <CardTitle className="text-2xl font-bold text-[#9F7AEA] flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-28" />
                  ) : (
                    <>
                      {formatCurrency((financeData?.paidRevenue || 0) - (financeData?.paidExpenses || 0), currency)}
                      <span className="text-xs ml-2 text-muted-foreground">(paid transactions only)</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
          </>
        )}

        {transactionType === "expense" && (
          <>
            <Card className="overflow-hidden border-l-4 border-l-[#c6909a] hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription className="text-sm font-medium">Outstanding Expenses</CardDescription>
                <CardTitle className="text-2xl font-bold text-[#c6909a] flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-28" />
                  ) : (
                    <>
                      {formatCurrency(financeData?.outstandingExpenses || 0, currency)}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-[#c6909a] hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription className="text-sm font-medium">Expenses Paid</CardDescription>
                <CardTitle className="text-2xl font-bold text-[#c6909a] flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-28" />
                  ) : (
                    <>
                      {formatCurrency(financeData?.paidExpenses || 0, currency)}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-[#c6909a] hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription className="text-sm font-medium">Monthly Total</CardDescription>
                <CardTitle className="text-2xl font-bold text-[#c6909a] flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-28" />
                  ) : (
                    <>
                      {formatCurrency(financeData?.totalExpenses || 0, currency)}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
          </>
        )}

        {transactionType === "revenue" && (
          <>
            <Card className="overflow-hidden border-l-4 border-l-[#A3E635] hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription className="text-sm font-medium">Outstanding Revenue</CardDescription>
                <CardTitle className="text-2xl font-bold text-[#A3E635] flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-28" />
                  ) : (
                    <>
                      {formatCurrency(financeData?.outstandingRevenue || 0, currency)}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-[#A3E635] hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription className="text-sm font-medium">Revenue Received</CardDescription>
                <CardTitle className="text-2xl font-bold text-[#A3E635] flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-28" />
                  ) : (
                    <>
                      {formatCurrency(financeData?.paidRevenue || 0, currency)}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-[#A3E635] hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription className="text-sm font-medium">Monthly Total</CardDescription>
                <CardTitle className="text-2xl font-bold text-[#A3E635] flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-28" />
                  ) : (
                    <>
                      {formatCurrency(financeData?.totalRevenue || 0, currency)}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
          </>
        )}
      </div>

      <Card className="shadow-sm border-border/40 rounded-lg overflow-hidden">
        <CardHeader className="bg-card/70 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle className="text-xl tracking-tight">Transactions</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={openAddExpenseModal}
                className="flex items-center shadow-sm"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                <span>Add Expense</span>
              </Button>
              <Button 
                onClick={openAddRevenueModal} 
                className="flex items-center shadow-sm bg-[#A3E635] hover:bg-[#A3E635]/90 text-black transition-all duration-200 hover:shadow-md"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                <span>Add Revenue</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap">
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={() => setTransactionType("all")}
                  className={cn(
                    "h-9 px-4 shadow-sm hover:shadow transition-all duration-200 min-w-[70px]",
                    transactionType === "all" && "filter-btn-all"
                  )}
                >
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  All
                </Button>
                <Button 
                  variant={transactionType === "revenue" ? "secondary" : "outline"} 
                  size="sm" 
                  onClick={() => setTransactionType("revenue")}
                  className={cn(
                    "h-9 px-4 min-w-[90px]",
                    transactionType === "revenue" && "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:text-green-800 dark:bg-green-800/40 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-800/60"
                  )}
                >
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5" />
                  Revenue
                </Button>
                <Button 
                  variant={transactionType === "expense" ? "secondary" : "outline"} 
                  size="sm" 
                  onClick={() => setTransactionType("expense")}
                  className={cn(
                    "h-9 px-4 min-w-[90px]",
                    transactionType === "expense" && "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 hover:text-red-800 dark:bg-red-800/40 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-800/60"
                  )}
                >
                  <div className="h-2 w-2 rounded-full bg-red-500 mr-1.5" />
                  Expenses
                </Button>
              </div>

              <div className="flex flex-wrap w-full md:space-y-0 md:flex-row md:items-center gap-3">
                <div className="relative flex-grow mb-3 md:mb-0 md:max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Month Selector */}
                  {dateRange === "month" && (
                    <div className="bg-background border rounded-md flex items-center h-9 px-2 shadow-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={goToPreviousMonth}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium px-2 min-w-[120px] text-center">
                        {format(currentMonth, 'MMMM yyyy')}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={goToNextMonth}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="h-9 w-[140px]">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Past year</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="h-9 w-[140px]">
                      <div className="h-3 w-3 rounded-full bg-primary mr-1.5 opacity-70" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={selectedAccount} 
                    onValueChange={setSelectedAccount}
                  >
                    <SelectTrigger className="h-9 w-[140px]">
                      <Wallet className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      <SelectValue placeholder="Account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Accounts</SelectItem>
                      <SelectItem value="bank">Bank Account</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" onValueChange={setTransactionType} className="w-full mt-4">
            <TabsContent value="all" className="mt-0">
              {renderTransactionsTable(
                filteredTransactions, 
                isLoading, 
                currency, 
                optimisticUpdates, 
                updateTransactionStatus,
                handleEditTransaction,
                handleDeleteTransaction
              )}
            </TabsContent>
            <TabsContent value="revenue" className="mt-0">
              {renderTransactionsTable(
                filteredTransactions.filter(t => t.type === 'revenue'), 
                isLoading, 
                currency, 
                optimisticUpdates, 
                updateTransactionStatus,
                handleEditTransaction,
                handleDeleteTransaction
              )}
            </TabsContent>
            <TabsContent value="expense" className="mt-0">
              {renderTransactionsTable(
                filteredTransactions.filter(t => t.type === 'expense'), 
                isLoading, 
                currency, 
                optimisticUpdates, 
                updateTransactionStatus,
                handleEditTransaction,
                handleDeleteTransaction
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modals */}
      {/* Regular Add Modals */}
      <AddExpenseModal 
        isOpen={expenseModalOpen} 
        onClose={closeAllModals} 
      />
      <AddRevenueModal 
        isOpen={revenueModalOpen} 
        onClose={closeAllModals} 
      />
      
      {/* Edit Modals */}
      <AddExpenseModal 
        isOpen={editExpenseModalOpen} 
        onClose={() => setEditExpenseModalOpen(false)} 
        expense={currentTransaction}
        isEditing={true}
      />
      <AddRevenueModal 
        isOpen={editRevenueModalOpen} 
        onClose={() => setEditRevenueModalOpen(false)} 
        revenue={currentTransaction}
        isEditing={true}
      />
      
      <FinanceSettingsModal 
        isOpen={settingsModalOpen} 
        onClose={() => setSettingsModalOpen(false)} 
      />
    </main>
  );
};

const filterTransactions = (transactions: any[]) => {
  //Filtering logic is already updated above
  return transactions;
}

const renderTransactionsTable = (
  transactions: any[], 
  isLoading: boolean, 
  currency: string, 
  optimisticUpdates: {[key: string]: boolean} = {}, 
  updateTransactionStatus: (transaction: any) => void,
  handleEditTransaction?: (transaction: any) => void,
  handleDeleteTransaction?: (transaction: any) => void
) => {
  if (isLoading) {
    return Array(5).fill(0).map((_, index) => (
      <div key={index} className="border-b border-border/40 py-4 px-6">
        <Skeleton className="h-8 w-full" />
      </div>
    ));
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
        <Wallet className="h-12 w-12 mb-3 text-muted-foreground/70" />
        <p className="font-medium">No transactions found</p>
        <p className="text-sm mt-1">Adjust your filters or add new transactions</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <th className="px-6 py-3 font-medium">Status</th>
            <th className="px-6 py-3 font-medium">Due Date</th>
            <th className="px-6 py-3 font-medium">Description</th>
            <th className="px-6 py-3 font-medium">Category</th>
            <th className="px-6 py-3 font-medium">Account</th>
            <th className="px-6 py-3 font-medium">Amount</th>
            <th className="px-6 py-3 font-medium">Type</th>
            <th className="px-6 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {transactions.map((transaction) => (
            <tr
              key={`${transaction.type}-${transaction.id}`}
              className={`hover:bg-muted/50 transition-colors ${
                transaction.dueDate && new Date(transaction.dueDate) < new Date() && !transaction.isPaid
                  ? 'bg-red-50/30 dark:bg-red-900/10'
                  : ''
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  {(() => {
                    const transactionKey = `${transaction.type}-${transaction.id}`;
                    // Get the current display status (from optimistic updates if available)
                    const isPaid = optimisticUpdates[transactionKey] !== undefined 
                      ? optimisticUpdates[transactionKey] 
                      : transaction.isPaid;

                    return (
                      <div className="flex gap-2 items-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          isPaid 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                        <div 
                          className={`w-10 h-5 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${
                            isPaid 
                              ? 'bg-green-500' 
                              : 'bg-muted-foreground/30'
                          }`}
                          onClick={() => updateTransactionStatus(transaction)}
                        >
                          <div 
                            className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 shadow-sm ${
                              isPaid ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                transaction.dueDate && new Date(transaction.dueDate) < new Date() && !transaction.isPaid
                  ? 'text-red-600 dark:text-red-400 font-medium'
                  : 'text-muted-foreground'
              }`}>
                {transaction.dueDate ? formatDate(transaction.dueDate) : '-'}
                {transaction.dueDate && new Date(transaction.dueDate) < new Date() && !transaction.isPaid &&
                  ' (Overdue)'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                <span>{transaction.description}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {transaction.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                <div className="flex items-center">
                  {transaction.account === "default" && <Wallet className="mr-2 h-4 w-4" />}
                  {transaction.account === "chase" && <SiChase className="mr-2 h-4 w-4" />}
                  {transaction.account === "bankofamerica" && <SiBankofamerica className="mr-2 h-4 w-4" />}
                  {transaction.account === "wells_fargo" && <SiWellsfargo className="mr-2 h-4 w-4" />}
                  {transaction.account === "paypal" && <SiPaypal className="mr-2 h-4 w-4" />}
                  {transaction.account === "stripe" && <SiStripe className="mr-2 h-4 w-4" />}
                  {transaction.account === "square" && <SiSquare className="mr-2 h-4 w-4" />}
                  {transaction.account === "venmo" && <SiVenmo className="mr-2 h-4 w-4" />}
                  {transaction.account === "cash" && <BanknoteIcon className="mr-2 h-4 w-4" />}
                  {transaction.account === "other" && <Landmark className="mr-2 h-4 w-4" />}
                  {bankAccounts.find(a => a.value === transaction.account)?.label || "Default"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                {formatCurrency(transaction.amount, currency)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  transaction.type === 'expense' 
                    ? 'bg-red-100/70 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                    : 'bg-green-100/70 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                }`}>
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2 justify-center">
                  {typeof handleEditTransaction === 'function' && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-muted" 
                      onClick={() => {
                        if (handleEditTransaction) handleEditTransaction(transaction);
                      }}
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                  {typeof handleDeleteTransaction === 'function' && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30" 
                      onClick={() => {
                        if (handleDeleteTransaction) handleDeleteTransaction(transaction);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};



export default Finance;