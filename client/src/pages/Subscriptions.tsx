import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency, formatDate, getInitials, cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModals } from "@/hooks/useModals";
import AddSubscriptionModal from "@/components/modals/AddSubscriptionModal";
import { 
  Plus, 
  Search, 
  Calendar, 
  Repeat, 
  Bell, 
  Filter, 
  Circle, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Edit2, 
  Clock 
} from "lucide-react";
import { frequencyOptions, dateRanges } from "@/lib/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

// Type definitions for better type safety
interface Subscription {
  id: number;
  name: string;
  amount: number;
  client: {
    id: number;
    name: string;
    email: string;
  };
  frequency: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  description?: string;
}

const Subscriptions = () => {
  const { currency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30"); // Default to last 30 days
  const { subscriptionModalOpen, closeAllModals, openAddSubscriptionModal } = useModals();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch subscriptions
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['/api/subscriptions', statusFilter, dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/subscriptions?status=${statusFilter}&dateRange=${dateRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }
      return response.json() as Promise<Subscription[]>;
    }
  });

  // Mutation for toggling subscription status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      return apiRequest("PATCH", `/api/subscriptions/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions', statusFilter, dateRange] });
      toast({
        title: "Subscription updated",
        description: "The subscription status has been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update subscription status",
        variant: "destructive",
      });
    },
  });

  const handleStatusToggle = (id: number, currentStatus: boolean) => {
    updateStatusMutation.mutate({ id, isActive: !currentStatus });
  };

  const getFrequencyLabel = (frequency: string) => {
    const option = frequencyOptions.find(opt => opt.value === frequency);
    return option ? option.label : frequency;
  };

  // Filter subscriptions based on search query and status
  const filteredSubscriptions = subscriptions
    ? subscriptions.filter(subscription => {
        // Filter by status
        if (statusFilter === "active" && !subscription.isActive) {
          return false;
        }
        if (statusFilter === "inactive" && subscription.isActive) {
          return false;
        }

        // Filter by search query
        if (searchQuery && 
            !subscription.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !subscription.client.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }

        return true;
      })
    : [];

  return (
    <main className="page-container">
      {/* Page header with motion animation */}
      <div className="page-header">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="page-title-container">
          <div>
            <h1 className="page-title">Subscriptions</h1>
            <p className="page-description">
              Manage your recurring revenue streams and subscription plans
            </p>
          </div>
          <Button 
            onClick={openAddSubscriptionModal} 
            className="flex items-center shadow-sm bg-primary hover:bg-primary/90 transition-all duration-200 hover:shadow-md"
            size="default"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            <span>Add Subscription</span>
          </Button>
        </motion.div>
      </div>

      {/* Filter controls */}
      <div className="filter-container flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* Status filter buttons - left side */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "filter-btn",
              statusFilter === 'all' ? "filter-btn-all" : ""
            )}
            onClick={() => setStatusFilter('all')}
          >
            <Filter className="h-4 w-4 mr-1.5" />
            All
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setStatusFilter('active')}
            className={cn(
              "filter-btn",
              statusFilter === 'active' ? "filter-btn-active" : ""
            )}
          >
            <div className="status-dot status-dot-active mr-1.5" />
            Active
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setStatusFilter('inactive')}
            className={cn(
              "filter-btn",
              statusFilter === 'inactive' ? "filter-btn-inactive" : ""
            )}
          >
            <div className="status-dot status-dot-inactive mr-1.5" />
            Inactive
          </Button>
        </div>

        {/* Search and date filter - right side */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search subscriptions..."
              className="filter-input w-[240px] md:w-[280px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="h-9 w-[140px] shadow-sm border-border/60">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subscriptions data card */}
      <Card className="content-card">
        <CardHeader className="card-header">
          <CardTitle className="card-title">
            <Repeat className="h-5 w-5 mr-2 text-primary" />
            Subscription Database
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          {renderSubscriptions(
            filteredSubscriptions, 
            isLoading,
            currency,
            getFrequencyLabel,
            handleStatusToggle,
            updateStatusMutation.isPending
          )}
        </CardContent>
      </Card>

      {/* Subscription modal */}
      <AddSubscriptionModal isOpen={subscriptionModalOpen} onClose={closeAllModals} />
    </main>
  );
};

// Helper component for rendering empty state
const EmptyState = () => (
  <div className="data-table-empty">
    <div className="data-table-icon">
      <Repeat className="h-6 w-6 text-primary" />
    </div>
    <h3 className="data-table-empty-title">No subscriptions found</h3>
    <p className="data-table-empty-description">
      Start adding recurring revenue streams by creating new subscription plans for your clients.
    </p>
    <Button 
      size="sm" 
      variant="outline" 
      onClick={() => {
        if (typeof window !== 'undefined' && window.openAddSubscriptionModal) {
          window.openAddSubscriptionModal();
        }
      }}
    >
      <Plus className="h-4 w-4 mr-1.5" />
      Add Your First Subscription
    </Button>
  </div>
);

// Render loading state, empty state, or subscription table
const renderSubscriptions = (
  subscriptions: Subscription[], 
  isLoading: boolean, 
  currency: string, 
  getFrequencyLabel: (frequency: string) => string,
  handleStatusToggle: (id: number, currentStatus: boolean) => void,
  isToggling: boolean
) => {
  if (isLoading) {
    return (
      <div className="p-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={`skeleton-${i}`} className="flex items-center space-x-4 py-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!subscriptions.length) {
    return <EmptyState />;
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead className="data-table-header">
          <tr>
            <th className="data-table-th">Name</th>
            <th className="data-table-th hidden sm:table-cell">Client</th>
            <th className="data-table-th">Amount</th>
            <th className="data-table-th hidden md:table-cell">Frequency</th>
            <th className="data-table-th hidden lg:table-cell">Dates</th>
            <th className="data-table-th">Status</th>
            <th className="data-table-th text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
            {subscriptions.map((subscription, index) => (
              <tr 
                key={`subscription-${subscription.id}`} 
                className={cn(
                  "data-table-row",
                  subscription.isActive ? 'bg-transparent' : 'bg-muted/20'
                )}
              >
                <td className="data-table-cell">
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 flex-shrink-0">
                      <Repeat className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-body-sm font-medium">{subscription.name}</p>
                      {subscription.description && (
                        <p className="text-muted-xs truncate max-w-[180px]">
                          {subscription.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </td>
                <td className="data-table-cell hidden sm:table-cell">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-accent/50 flex items-center justify-center text-foreground text-xs font-medium flex-shrink-0">
                      {getInitials(subscription.client.name)}
                    </div>
                    <p className="text-body-sm ml-3 hidden md:block">
                      {subscription.client.name}
                    </p>
                  </div>
                </td>
                <td className="data-table-cell">
                  <div className="flex flex-col">
                    <span className="text-body-sm font-medium">
                      {formatCurrency(subscription.amount, currency)}
                    </span>
                    <span className="text-muted-xs">
                      {getFrequencyLabel(subscription.frequency)}
                    </span>
                  </div>
                </td>
                <td className="data-table-cell hidden md:table-cell">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                    <p className="text-body-sm">{getFrequencyLabel(subscription.frequency)}</p>
                  </div>
                </td>
                <td className="data-table-cell hidden lg:table-cell">
                  <div className="flex flex-col">
                    <p className="text-muted-xs">
                      <span className="text-muted-foreground">Start:</span> {formatDate(subscription.startDate)}
                    </p>
                    <p className="text-muted-xs">
                      <span className="text-muted-foreground">End:</span> {subscription.endDate ? formatDate(subscription.endDate) : 'Ongoing'}
                    </p>
                  </div>
                </td>
                <td className="data-table-cell">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={subscription.isActive}
                      onCheckedChange={() => handleStatusToggle(subscription.id, subscription.isActive)}
                      disabled={isToggling}
                      className="data-[state=checked]:bg-green-500"
                    />
                    <Badge 
                      variant={subscription.isActive ? "outline" : "secondary"} 
                      className={subscription.isActive ? "status-active" : "status-inactive"}
                    >
                      {subscription.isActive 
                        ? <CheckCircle2 className="h-3 w-3 mr-1 inline" /> 
                        : <XCircle className="h-3 w-3 mr-1 inline" />
                      }
                      {subscription.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </td>
                <td className="data-table-cell text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Subscriptions;