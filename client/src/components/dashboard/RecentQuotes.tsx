import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getInitials, formatDate } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const colorVariants = [
  { bg: 'bg-[#3DAFC4]/20 dark:bg-[#3DAFC4]/30', text: 'text-[#3DAFC4]' },
  { bg: 'bg-[#F0CE8D]/20 dark:bg-[#F0CE8D]/30', text: 'text-[#F0CE8D]' },
  { bg: 'bg-[#7D6BA7]/20 dark:bg-[#7D6BA7]/30', text: 'text-[#7D6BA7]' },
  { bg: 'bg-[#C6909A]/20 dark:bg-[#C6909A]/30', text: 'text-[#C6909A]' },
  { bg: 'bg-[#242424]/20 dark:bg-[#242424]/30', text: 'text-[#242424] dark:text-gray-300' },
];

const RecentQuotes = () => {
  const { currency } = useCurrency();

  // Use the correct endpoint for recent quotes
  const { data: recentQuotes, isLoading } = useQuery({
    queryKey: ['/api/quotes/recent'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/quotes/recent');
      return await response.json();
    }
  });


  
  // Custom badge styles based on status
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'bg-[#3DAFC4]/20 text-[#3DAFC4] border-[#3DAFC4]/30 hover:bg-[#3DAFC4]/30';
      case 'Declined':
        return 'bg-[#C6909A]/20 text-[#C6909A] border-[#C6909A]/30 hover:bg-[#C6909A]/30';
      case 'Pending':
        return 'bg-[#F0CE8D]/20 text-[#F0CE8D] border-[#F0CE8D]/30 hover:bg-[#F0CE8D]/30';
      default:
        return 'bg-[#7D6BA7]/20 text-[#7D6BA7] border-[#7D6BA7]/30 hover:bg-[#7D6BA7]/30';
    }
  };

  // Format currency with the correct currency symbol
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  return (
    <Card className="lg:col-span-2">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Quotes</h3>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-4">
              {Array(4).fill(0).map((_, index) => (
                <div key={index} className="w-full">
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead>
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Job Quoted
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-800">
                {Array.isArray(recentQuotes) && recentQuotes.map((quote, index) => (
                  <tr key={`quote-${quote.id || index}`} className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-full ${colorVariants[index % colorVariants.length].bg} flex items-center justify-center ${colorVariants[index % colorVariants.length].text} text-xs`}>
                          {getInitials(quote.client?.name || 'Unknown')}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {quote.client?.name || 'Unknown Client'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {quote.client?.businessType || ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-gray-900 dark:text-white">{quote.jobTitle}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-gray-900 dark:text-white">{formatCurrency(Number(quote.amount))}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeStyle(quote.status)}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(quote.createdAt)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="mt-6">
            <Link href="/quotes">
              <button className="w-full py-2 text-sm font-medium text-[#3DAFC4] hover:text-[#3DAFC4]/80 dark:text-[#3DAFC4] dark:hover:text-[#3DAFC4]/90 transition">
                View All Quotes
              </button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentQuotes;