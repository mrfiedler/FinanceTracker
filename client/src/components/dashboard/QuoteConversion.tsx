
import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Clock, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const QuoteConversion = () => {
  const { currency } = useCurrency();
  const [dateRange, setDateRange] = useState("all");
  const [customDateRange, setCustomDateRange] = useState<Date | undefined>(undefined);

  const { data: conversionData, isLoading } = useQuery({
    queryKey: ['/api/quotes/conversion', dateRange, customDateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange !== "all" && dateRange !== "custom") {
        params.append("dateRange", dateRange);
      }
      if (dateRange === "custom" && customDateRange) {
        params.append("dateRange", customDateRange.toISOString());
      }
      const response = await fetch(`/api/quotes/conversion?${params.toString()}`);
      return response.json();
    },
  });

  const quoteStatuses = [
    {
      label: "Accepted",
      count: conversionData?.accepted?.count || 0,
      value: conversionData?.accepted?.value || 0,
      icon: <CheckCircle className="h-5 w-5" />,
      bgColor: "bg-[#3DAFC4]/20 dark:bg-[#3DAFC4]/30",
      textColor: "text-[#3DAFC4]"
    },
    {
      label: "Declined",
      count: conversionData?.declined?.count || 0,
      value: conversionData?.declined?.value || 0,
      icon: <XCircle className="h-5 w-5" />,
      bgColor: "bg-[#C6909A]/20 dark:bg-[#C6909A]/30",
      textColor: "text-[#C6909A]"
    },
    {
      label: "Pending",
      count: conversionData?.pending?.count || 0,
      value: conversionData?.pending?.value || 0,
      icon: <Clock className="h-5 w-5" />,
      bgColor: "bg-[#F0CE8D]/20 dark:bg-[#F0CE8D]/30",
      textColor: "text-[#F0CE8D]"
    }
  ];

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quote Conversion Rate</h3>
          <div className="flex items-center gap-2">
            {dateRange === "custom" ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CalendarIcon className="h-4 w-4" />
                    {customDateRange ? format(customDateRange, "LLL dd, y") : "Pick a date"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={customDateRange}
                    onSelect={setCustomDateRange}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            ) : null}
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[160px] h-9 border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Past year</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <>
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-6" />
            <div className="space-y-4">
              {Array(3).fill(0).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="w-full ml-3">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 relative pt-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Conversion Rate</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-[#3DAFC4] to-[#7D6BA7] bg-clip-text text-transparent">
                  {(conversionData?.conversionRate || 0).toFixed(1)}%
                </span>
              </div>
              <div className="relative h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                <div
                  className="absolute top-0 h-full bg-gradient-to-r from-[#3DAFC4] to-[#7D6BA7] transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${conversionData?.conversionRate || 0}%` }}
                >
                  <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiIGlkPSJhIj48c3RvcCBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9Ii4yIiBvZmZzZXQ9IjAlIi8+PHN0b3Agc3RvcC1jb2xvcj0iI2ZmZiIgc3RvcC1vcGFjaXR5PSIwIiBvZmZzZXQ9IjEwMCUiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cGF0aCBmaWxsPSJ1cmwoI2EpIiBkPSJNMCAwaDMwdjMwSDB6Ii8+PC9zdmc+')] animate-shine"></div>
                </div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">0%</span>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">100%</span>
              </div>
            </div>

            <div className="space-y-4">
              {quoteStatuses.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-full ${status.bgColor} flex items-center justify-center ${status.textColor}`}>
                      {status.icon}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{status.label}</p>
                      <p className="text-sm text-gray-900 dark:text-white">{status.count} quotes</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(status.value, currency)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default QuoteConversion;
