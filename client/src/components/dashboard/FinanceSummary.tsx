import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, BarChart2, Clock, CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

// Define FinanceSummary data structure
interface FinanceSummaryData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueChange: number;
  expensesChange: number;
  profitChange: number;
  outstandingPayments: number;
  pendingClients: number;
}

const FinanceSummary = () => {
  const { currency } = useCurrency();
  const [dateRange, setDateRange] = useState("30");
  const [date, setDate] = useState<DateRange>({ 
    from: undefined,
    to: undefined 
  });

  // Properly type the query result
  const { data: financeSummary = {
    netProfit: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    profitChange: 0,
    revenueChange: 0,
    expensesChange: 0,
    outstandingPayments: 0,
    pendingClients: 0
  } as FinanceSummaryData, isLoading } = useQuery<FinanceSummaryData>({
    queryKey: ['/api/finance/summary', dateRange],
  });

  const summaryCards = [
    {
      title: "Current Balance",
      amount: financeSummary?.netProfit || 0,
      change: financeSummary?.profitChange || 0,
      icon: <BarChart2 className="h-6 w-6" />,
      bgColor: "bg-[#3DAFC4]/20 dark:bg-[#3DAFC4]/30",
      textColor: "text-[#3DAFC4]"
    },
    {
      title: "Total Revenue",
      amount: financeSummary?.totalRevenue || 0,
      change: financeSummary?.revenueChange || 0,
      icon: <TrendingUp className="h-6 w-6" />,
      bgColor: "bg-[#A3E635]/20 dark:bg-[#A3E635]/30",
      textColor: "text-[#A3E635]"
    },
    {
      title: "Total Expenses",
      amount: financeSummary?.totalExpenses || 0,
      change: financeSummary?.expensesChange || 0,
      icon: <TrendingDown className="h-6 w-6" />,
      bgColor: "bg-[#C6909A]/20 dark:bg-[#C6909A]/30",
      textColor: "text-[#C6909A]"
    },
    {
      title: "Outstanding Payments",
      amount: financeSummary?.outstandingPayments || 0,
      pendingClients: financeSummary?.pendingClients || 0,
      icon: <Clock className="h-6 w-6" />,
      bgColor: "bg-[#7D6BA7]/20 dark:bg-[#7D6BA7]/30",
      textColor: "text-[#7D6BA7]"
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Finance Summary
        </h2>
        
        {/* Date range selector - horizontal scrolling on mobile */}
        <div className="relative w-full sm:w-auto">
          <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full sm:flex-wrap">
            <div className="md:hidden">
              <Select value={dateRange} onValueChange={(value) => setDateRange(value)}>
                <SelectTrigger className="w-[140px] bg-white dark:bg-zinc-800 text-sm">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { value: "7", label: "Last 7 days" },
                    { value: "30", label: "Last 30 days" },
                    { value: "60", label: "Last 60 days" },
                    { value: "90", label: "Last 90 days" },
                    { value: "365", label: "Past year" },
                    { value: "custom", label: "Custom range" }
                  ].map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Desktop view with buttons */}
            <div className="hidden md:flex md:flex-wrap gap-2">
              {[
                { value: "7", label: "7 days" },
                { value: "30", label: "30 days" },
                { value: "90", label: "90 days" },
                { value: "365", label: "Year" },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setDateRange(range.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                    ${dateRange === range.value 
                      ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-zinc-700' 
                      : 'bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300'
                    }`}
                  aria-label={`Show data for ${range.label}`}
                >
                  {range.label}
                </button>
              ))}
              
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    className={`px-3 py-1.5 text-sm font-medium rounded-md inline-flex items-center gap-1
                      ${dateRange === 'custom'
                        ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-zinc-700'
                        : 'bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300'
                      }`}
                    aria-label="Pick a custom date range"
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span className="whitespace-nowrap">
                      {date?.from && date?.to 
                        ? `${format(date.from, "MM/dd")} - ${format(date.to, "MM/dd")}`
                        : "Custom"
                      }
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={(range) => {
                      if (range) {
                        setDate(range);
                        setDateRange('custom');
                      }
                    }}
                    numberOfMonths={2}
                    className="hidden sm:block"
                  />
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={(range) => {
                      if (range) {
                        setDate(range);
                        setDateRange('custom');
                      }
                    }}
                    numberOfMonths={1}
                    className="block sm:hidden"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-5">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-10 w-24 mb-2" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ))
        ) : (
          summaryCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: {
                  delay: index * 0.1,
                  duration: 0.4,
                  type: "spring",
                  stiffness: 200
                }
              }}
              whileHover={{ 
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { duration: 0.2 }
              }}
              className="overflow-hidden rounded-lg"
            >
              <Card className="h-full border-0 overflow-hidden">
                {/* Add subtle glowing border on hover - arcade style */}
                <motion.div
                  className="absolute inset-0 pointer-events-none z-0 opacity-0"
                  whileHover={{ opacity: 1 }}
                >
                  <div className={`absolute inset-0 blur-sm opacity-20 ${card.bgColor}`}></div>
                </motion.div>
                
                <CardContent className="p-5 relative z-10 h-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                      <motion.h3 
                        className="text-2xl font-bold mt-1 text-gray-900 dark:text-white"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1,
                          transition: { 
                            delay: index * 0.1 + 0.3,
                            type: "spring",
                            stiffness: 300
                          }
                        }}
                        // Add number counting animation
                        key={`${card.amount}-${currency}`}
                      >
                        {formatCurrency(card.amount, currency)}
                      </motion.h3>
                    </div>
                    
                    <motion.div 
                      className={`h-12 w-12 rounded-full ${card.bgColor} flex items-center justify-center ${card.textColor}`}
                      initial={{ rotate: -30, opacity: 0 }}
                      animate={{ 
                        rotate: 0, 
                        opacity: 1,
                        transition: {
                          delay: index * 0.1 + 0.2,
                          type: "spring",
                          stiffness: 200
                        }
                      }}
                      whileHover={{ 
                        rotate: [0, -10, 10, -10, 0],
                        scale: 1.1,
                        transition: { duration: 0.5 }
                      }}
                    >
                      {card.icon}
                    </motion.div>
                  </div>
                  
                  <div className="mt-4 flex items-center">
                    {card.title !== "Outstanding Payments" ? (
                      <>
                        <motion.span 
                          className={`text-sm font-medium flex items-center ${card.change && card.change >= 0 ? 'text-[#A3E635]' : 'text-[#C6909A]'}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ 
                            opacity: 1, 
                            x: 0,
                            transition: { 
                              delay: index * 0.1 + 0.4,
                              duration: 0.3
                            }
                          }}
                        >
                          <motion.div
                            animate={{ 
                              y: card.change && card.change >= 0 ? [0, -3, 0] : [0, 3, 0],
                            }}
                            transition={{ 
                              repeat: Infinity, 
                              repeatDelay: 2,
                              duration: 1
                            }}
                          >
                            {card.change && card.change >= 0 ? (
                              <TrendingUp className="h-4 w-4 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 mr-1" />
                            )}
                          </motion.div>
                          <span className="score-update">
                            {Number(card.change || 0).toFixed(2)}%
                          </span>
                        </motion.span>
                        <motion.span 
                          className="text-sm text-gray-500 dark:text-gray-400 ml-2"
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: 1,
                            transition: { 
                              delay: index * 0.1 + 0.5,
                              duration: 0.3
                            }
                          }}
                        >
                          from last period
                        </motion.span>
                      </>
                    ) : (
                      <>
                        <motion.span 
                          className="text-sm font-medium text-[#7D6BA7] flex items-center"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ 
                            opacity: 1, 
                            x: 0,
                            transition: { 
                              delay: index * 0.1 + 0.4,
                              duration: 0.3
                            }
                          }}
                          whileHover={{ 
                            scale: 1.05,
                            transition: { duration: 0.2 }
                          }}
                        >
                          <BarChart2 className="h-4 w-4 mr-1" />
                          <motion.span className="relative" whileHover={{ scale: 1.1 }}>
                            {card.pendingClients} 
                            <motion.span
                              className="absolute -top-2 -right-2 flex h-2 w-2"
                            >
                              <motion.span
                                className="absolute inline-flex h-full w-full rounded-full bg-[#7D6BA7] opacity-75"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                              />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7D6BA7]" />
                            </motion.span>
                          </motion.span>
                          <span className="ml-1">clients</span>
                        </motion.span>
                        <motion.span 
                          className="text-sm text-gray-500 dark:text-gray-400 ml-2"
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: 1,
                            transition: { 
                              delay: index * 0.1 + 0.5,
                              duration: 0.3
                            }
                          }}
                        >
                          with pending invoices
                        </motion.span>
                      </>
                    )}
                  </div>
                  
                  {/* Add a subtle arcade game shine effect */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <motion.div 
                      className="absolute -inset-[30%] opacity-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
                      animate={{ 
                        x: ["210%", "-180%"],
                        opacity: [0, 0.2, 0]
                      }}
                      transition={{ 
                        repeat: Infinity,
                        repeatDelay: index + 4,
                        duration: 1.5,
                        ease: "easeInOut" 
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default FinanceSummary;