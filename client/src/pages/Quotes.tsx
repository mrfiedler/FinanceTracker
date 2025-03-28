import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dateRanges, quoteStatusOptions } from "@/lib/constants";
import { useModals } from "@/hooks/useModals";
import CreateQuoteModal from "@/components/modals/CreateQuoteModal";
import ConvertToRevenueModal from "@/components/modals/ConvertToRevenueModal";
import { Plus, Search, FileText, CircleCheck, CircleX, Clock, Filter, Calendar } from "lucide-react";

// Declare global window interface for TypeScript
declare global {
  interface Window {
    openCreateQuoteModal?: () => void;
  }
}

// Quote interface
interface Quote {
  id: number;
  jobTitle: string;
  amount: number;
  status: string;
  createdAt: string;
  validUntil: string;
  client: {
    id: number;
    name: string;
  };
}

const Quotes = () => {
  const { currency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("30");
  const [statusFilter, setStatusFilter] = useState("all");
  const [convertToRevenueModalOpen, setConvertToRevenueModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const { quoteModalOpen, closeAllModals, openCreateQuoteModal } = useModals();

  // Set up the global window function for opening the modal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.openCreateQuoteModal = openCreateQuoteModal;
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.openCreateQuoteModal = undefined;
      }
    };
  }, [openCreateQuoteModal]);

  const { data: quotes = [], isLoading } = useQuery<Quote[]>({
    queryKey: ['/api/quotes', dateRange, statusFilter],
  });
  
  // Function to invalidate query cache
  const invalidateQuoteQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
  };

  const filteredQuotes = quotes.filter((quote: Quote) => {
    // Filter by status
    if (statusFilter !== "all" && quote.status !== statusFilter) {
      return false;
    }

    // Filter by search query
    if (searchQuery && 
        !quote.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !quote.client.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case 'Accepted':
        return <CircleCheck className="h-4 w-4 text-[#A3E635]" />;
      case 'Declined':
        return <CircleX className="h-4 w-4 text-red-600" />;
      case 'Pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Accepted':
        return 'bg-[#A3E635]/20 dark:bg-[#A3E635]/30 text-[#85BC21] dark:text-[#A3E635]';
      case 'Declined':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'Pending':
      default:
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    }
  };

  return (
    <main className="w-full h-full overflow-y-auto p-4 md:p-6 pb-20">
      {/* Page header with standardized styling */}
      <div className="page-header">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="page-title">Quotes</h1>
            <p className="page-description">
              Create and manage quotes for your clients and track their status
            </p>
          </div>
          <Button 
            onClick={openCreateQuoteModal} 
            className="flex items-center shadow-sm bg-primary hover:bg-primary/90 transition-all duration-200 hover:shadow-md"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            <span>Create Quote</span>
          </Button>
        </div>
      </div>

      {/* Filter controls with improved styling */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setStatusFilter('all')}
                className={cn(
                  "h-9 px-4 shadow-sm hover:shadow transition-all duration-200",
                  statusFilter === 'all' && "filter-btn-all"
                )}
              >
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                All
              </Button>
              <Button 
                variant={statusFilter === 'Accepted' ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setStatusFilter('Accepted')}
                className={cn(
                  "h-8 shadow-sm hover:shadow transition-all duration-200",
                  statusFilter === 'Accepted' && "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:text-green-800 dark:bg-green-800/40 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-800/60"
                )}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-1.5" />
                Accepted
              </Button>
              <Button 
                variant={statusFilter === 'Pending' ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setStatusFilter('Pending')}
                className={cn(
                  "h-8 shadow-sm hover:shadow transition-all duration-200",
                  statusFilter === 'Pending' && "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200 hover:text-yellow-800 dark:bg-yellow-800/40 dark:text-yellow-300 dark:border-yellow-700 dark:hover:bg-yellow-800/60"
                )}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 mr-1.5" />
                Pending
              </Button>
              <Button 
                variant={statusFilter === 'Declined' ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setStatusFilter('Declined')}
                className={cn(
                  "h-8 shadow-sm hover:shadow transition-all duration-200",
                  statusFilter === 'Declined' && "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 hover:text-red-800 dark:bg-red-800/40 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-800/60"
                )}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-1.5" />
                Declined
              </Button>
            </div>
            <div className="relative flex-grow max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search quotes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 w-full shadow-sm"
              />
            </div>
            <div className="flex-none">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="h-8 w-full min-w-[140px] shadow-sm border-border/60">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
      </div>

      <Card className="shadow-sm border-border/60">
        <CardHeader className="px-5 py-4">
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Quote Database
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {renderQuotesTable(filteredQuotes, isLoading, currency, getStatusIcon, getStatusColor, invalidateQuoteQueries, setSelectedQuote, setConvertToRevenueModalOpen)}
        </CardContent>
      </Card>

      <CreateQuoteModal isOpen={quoteModalOpen} onClose={closeAllModals} />
      <ConvertToRevenueModal 
        isOpen={convertToRevenueModalOpen} 
        onClose={() => setConvertToRevenueModalOpen(false)} 
        quote={selectedQuote} 
      />
    </main>
  );
};

const renderQuotesTable = (
  quotes: Quote[], 
  isLoading: boolean, 
  currency: string,
  getStatusIcon: (status: string) => JSX.Element, 
  getStatusColor: (status: string) => string, 
  invalidateQuery: () => void,
  setSelectedQuote: React.Dispatch<React.SetStateAction<Quote | null>>,
  setConvertToRevenueModalOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (isLoading) {
    return (
      <div className="p-6">
        {Array(4).fill(0).map((_, index) => (
          <div key={`skeleton-${index}`} className="flex items-center space-x-4 py-4 border-b border-border last:border-none">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-grow">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[180px]" />
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
        <div className="bg-primary/10 p-3 rounded-full mb-4">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No quotes found</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          Start creating quotes for your clients to track potential business opportunities.
        </p>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => {
            if (typeof window !== 'undefined' && window.openCreateQuoteModal) {
              window.openCreateQuoteModal();
            }
          }}
          className="shadow-sm hover:shadow transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Your First Quote
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-350px)] md:max-h-[calc(100vh-320px)] rounded-md">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/40 border-b border-border text-xs uppercase tracking-wider sticky top-0 z-10">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Job Title</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Created</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Valid Until</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {quotes.map((quote) => {
            return (
              <tr key={quote.id} className="hover:bg-accent/50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-accent/50 flex items-center justify-center text-foreground text-xs font-medium">
                      {getInitials(quote.client.name)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-foreground">{quote.client.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <p className="text-sm text-foreground">{quote.jobTitle}</p>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <p className="text-sm font-medium text-foreground">
                    {formatCurrency(quote.amount, currency)}
                  </p>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Select 
                    value={quote.status} 
                    onValueChange={async (value) => {
                      await fetch(`/api/quotes/${quote.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: value })
                      });
                      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
                      
                      // If the quote is being marked as Accepted, open the ConvertToRevenueModal
                      if (value === 'Accepted') {
                        setSelectedQuote(quote);
                        setConvertToRevenueModalOpen(true);
                      }
                    }}
                  >
                    <SelectTrigger className={`w-[130px] ${getStatusColor(quote.status)}`}>
                      <SelectValue>{quote.status}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {quoteStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                  <p className="text-sm text-muted-foreground">{formatDate(quote.createdAt)}</p>
                </td>
                <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                  <p className="text-sm text-muted-foreground">{formatDate(quote.validUntil)}</p>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200"
                    >
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200"
                    >
                      Edit
                    </Button>
                    {quote.status === 'Accepted' ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-[#A3E635] border-[#A3E635] hover:bg-[#A3E635]/10 hidden md:inline-flex transition-all duration-200"
                        onClick={() => {
                          setSelectedQuote(quote);
                          setConvertToRevenueModalOpen(true);
                        }}
                      >
                        Convert to Revenue
                      </Button>
                    ) : (
                      <div className="rounded-md justify-center text-muted-foreground border border-border py-2 px-4 text-xs cursor-not-allowed hidden md:inline-flex w-[146px]">
                        Not Eligible
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

import { cn } from "@/lib/utils";

export default Quotes;