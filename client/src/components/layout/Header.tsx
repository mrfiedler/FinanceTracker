import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Menu, Search, Bell, Sun, Moon, X, Globe,
  Check, Clock, CheckCheck, Info, AlertTriangle,
  FileText, User, DollarSign, File, CalendarClock
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { Notification } from "@shared/schema";
import { format, formatDistanceToNow } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { debounce } from "@/lib/utils";

declare global {
  interface Window {
    toggleSidebar?: () => void;
  }
}

// Define search result types
interface SearchResult {
  clients: Array<{
    id: number;
    name: string;
    email?: string;
    phone?: string;
  }>;
  contracts: Array<{
    id: number;
    title: string;
    description?: string;
    status: string;
  }>;
  quotes: Array<{
    id: number;
    title: string;
    description?: string;
    status: string;
  }>;
  transactions: Array<{
    id: number;
    description?: string;
    category?: string;
    type: string;
    amount?: number;
  }>;
  subscriptions: Array<{
    id: number;
    name?: string;
    description?: string;
    status?: string;
    amount?: number;
  }>;
}

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSearch, setShowSearch] = useState(false);
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch notifications
  const { data: notifications = [], isLoading: isLoadingNotifications, refetch: refetchNotifications } = 
    useQuery<Notification[]>({
      queryKey: ['/api/notifications'],
      staleTime: 60000 // 1 minute
    });

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('PATCH', `/api/notifications/${id}/mark-read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Notification marked as read",
        description: "The notification has been marked as read.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    }
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('PATCH', '/api/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "All notifications marked as read",
        description: "All notifications have been marked as read.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      });
    }
  });

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'level_up':
        return <Check className="h-4 w-4" />;
      case 'transaction_due':
        return <Clock className="h-4 w-4" />;
      case 'payment_received':
        return <CheckCheck className="h-4 w-4" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    switch(type) {
      case 'level_up':
        return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400';
      case 'transaction_due':
        return 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400';
      case 'payment_received':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400';
      case 'alert':
        return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  // Format notification date
  const formatNotificationDate = (date: string | Date | null) => {
    if (!date) return 'Unknown date';

    try {
      const notificationDate = date instanceof Date ? date : new Date(date);
      return formatDistanceToNow(notificationDate, { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Search functionality
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Search request failed');
      }
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Unable to complete your search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Create debounced search function
  const debouncedSearch = debounce((query: string) => {
    performSearch(query);
  }, 300);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle clicking on a search result
  const handleResultClick = (path: string) => {
    setLocation(path);
    setShowResults(false);
    setSearchQuery("");
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchResultsRef.current && 
        !searchResultsRef.current.contains(event.target as Node) &&
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Monitor screen size changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-hide search on mobile, show on desktop
      if (!mobile && !showSearch) {
        setShowSearch(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showSearch]);

  // Handle escape key to close search results
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowResults(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Get appropriate icon for search result type
  const getSearchResultIcon = (type: string) => {
    switch(type) {
      case 'client':
        return <User className="h-4 w-4" />;
      case 'contract':
        return <File className="h-4 w-4" />;
      case 'quote':
        return <FileText className="h-4 w-4" />;
      case 'transaction':
        return <DollarSign className="h-4 w-4" />;
      case 'subscription':
        return <CalendarClock className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const toggleSidebar = () => {
    if (window.toggleSidebar) {
      window.toggleSidebar();
    }
  };

  return (
    <header className="bg-white dark:bg-[#2e2e2e] border-b border-gray-200 dark:border-[#3d3d3d] shadow-sm z-10 sticky top-0">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button and header left side */}
          <div className="flex items-center">
            <button 
              id="mobile-menu-button" 
              type="button"
              onClick={toggleSidebar}
              className="md:hidden text-gray-500 hover:text-gray-600 dark:text-[#b3b3b3] dark:hover:text-[#e6e6e6] mr-3"
              aria-label="Toggle sidebar menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo shown only when sidebar is hidden on mobile */}
            {isMobile && (
              <img 
                src={theme === 'dark' ? '/images/logo-dark.png' : '/images/logo-light.png'} 
                alt="Eluvie Logo" 
                className="h-8" 
              />
            )}
          </div>

          {/* Search - adaptive for mobile and desktop */}
          <div className={`${isMobile && !showSearch ? 'hidden' : 'flex-1 flex'} 
                          items-center justify-center transition-all duration-200 ease-in-out 
                          ${isMobile ? 'absolute inset-x-0 top-0 bg-white dark:bg-[#2e2e2e] h-16 px-4 z-20' : 'relative mx-4 md:mx-6'}`}>
            {isMobile && showSearch && (
              <button 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                onClick={() => setShowSearch(false)}
              >
                <X className="h-5 w-5" />
              </button>
            )}

            <div className={`relative w-full ${isMobile && showSearch ? 'pl-10' : ''} max-w-md mx-auto`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isSearching ? (
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="h-4 w-4 text-gray-400 dark:text-[#b3b3b3]" />
                )}
              </div>
              <input 
                ref={searchInputRef}
                type="text" 
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search clients, contracts, quotes..." 
                className="pl-10 pr-4 py-2 w-full rounded-lg text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              {/* Search results dropdown */}
              {showResults && searchResults && (
                <div 
                  ref={searchResultsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[70vh] overflow-auto"
                >
                  {/* No results message */}
                  {Object.values(searchResults).every(arr => arr.length === 0) && (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No results found for "{searchQuery}"
                    </div>
                  )}

                  {/* Clients section */}
                  {searchResults.clients.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Clients
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {searchResults.clients.map(client => (
                          <div 
                            key={`client-${client.id}`}
                            className="p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={() => handleResultClick(`/clients/${client.id}`)}
                          >
                            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center flex-shrink-0">
                              {getSearchResultIcon('client')}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{client.name}</p>
                              {client.email && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{client.email}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contracts section */}
                  {searchResults.contracts.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Contracts
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {searchResults.contracts.map(contract => (
                          <div 
                            key={`contract-${contract.id}`}
                            className="p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={() => handleResultClick(`/contracts/${contract.id}`)}
                          >
                            <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center flex-shrink-0">
                              {getSearchResultIcon('contract')}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{contract.title}</p>
                              <div className="flex items-center mt-1">
                                <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                                  {contract.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quotes section */}
                  {searchResults.quotes.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Quotes
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {searchResults.quotes.map(quote => (
                          <div 
                            key={`quote-${quote.id}`}
                            className="p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={() => handleResultClick(`/quotes/${quote.id}`)}
                          >
                            <div className="h-8 w-8 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full flex items-center justify-center flex-shrink-0">
                              {getSearchResultIcon('quote')}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{quote.title}</p>
                              <div className="flex items-center mt-1">
                                <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                                  {quote.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transactions section */}
                  {searchResults.transactions.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Transactions
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {searchResults.transactions.map(transaction => (
                          <div 
                            key={`transaction-${transaction.id}`}
                            className="p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={() => handleResultClick(`/finance`)}
                          >
                            <div className="h-8 w-8 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 rounded-full flex items-center justify-center flex-shrink-0">
                              {getSearchResultIcon('transaction')}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{transaction.description || `Transaction #${transaction.id}`}</p>
                              <div className="flex items-center mt-1">
                                <Badge variant="outline" className={`text-xs px-1.5 py-0 h-5 ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400 border-green-300 dark:border-green-700' : 'text-red-600 dark:text-red-400 border-red-300 dark:border-red-700'}`}>
                                  {transaction.type}
                                </Badge>
                                {transaction.category && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{transaction.category}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subscriptions section */}
                  {searchResults.subscriptions.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Subscriptions
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {searchResults.subscriptions.map(subscription => (
                          <div 
                            key={`subscription-${subscription.id}`}
                            className="p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={() => handleResultClick(`/subscriptions`)}
                          >
                            <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center justify-center flex-shrink-0">
                              {getSearchResultIcon('subscription')}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{subscription.name || `Subscription #${subscription.id}`}</p>
                              {subscription.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{subscription.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Search toggle button (mobile only) */}
            {isMobile && !showSearch && (
              <button 
                type="button"
                onClick={() => setShowSearch(true)}
                className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label="Show search"
              >
                <Search className="h-5 w-5" />
              </button>
            )}

            {/* Currency selector - hidden on smallest screens */}
            <div className="hidden sm:block">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-gray-100 px-2 py-1.5 text-sm w-[70px]">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="BRL">BRL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language selector */}
            <div className="hidden sm:block ml-2">
              <LanguageSelector />
            </div>

            {/* Theme toggle */}
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    id="theme-toggle" 
                    onClick={toggleTheme}
                    className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Notification dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 relative"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-normal">{unreadCount} new</Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 text-xs"
                          onClick={() => markAllAsReadMutation.mutate()}
                          disabled={markAllAsReadMutation.isPending}
                        >
                          Mark all read
                        </Button>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                  {isLoadingNotifications ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      <p>No notifications</p>
                    </div>
                  ) : (
                    // Filter to only show unread notifications in the dropdown
                    notifications.filter(notification => !notification.isRead).map((notification) => (
                      <DropdownMenuItem 
                        key={notification.id} 
                        className="flex items-start gap-3 p-3 cursor-pointer hover:bg-accent"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                      >
                        <div className={`h-8 w-8 rounded-full ${getNotificationColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">{formatNotificationDate(notification.createdAt || '')}</p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex justify-center items-center p-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-center"
                    onClick={() => setLocation("/notifications")}
                  >
                    View all notifications
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;