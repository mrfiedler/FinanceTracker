import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import { Link } from "wouter";

const TopClients = () => {
  const { currency } = useCurrency();

  const { data: topClients, isLoading } = useQuery({
    queryKey: ['/api/clients/top'],
  });

  const colorVariants = [
    { bg: "bg-[#3DAFC4]/20 dark:bg-[#3DAFC4]/30", text: "text-[#3DAFC4]" },
    { bg: "bg-[#F0CE8D]/20 dark:bg-[#F0CE8D]/30", text: "text-[#F0CE8D]" },
    { bg: "bg-[#7D6BA7]/20 dark:bg-[#7D6BA7]/30", text: "text-[#7D6BA7]" },
    { bg: "bg-[#C6909A]/20 dark:bg-[#C6909A]/30", text: "text-[#C6909A]" },
    { bg: "bg-[#242424]/20 dark:bg-[#242424]/30", text: "text-[#242424] dark:text-gray-300" },
  ];

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Top Clients by Revenue</h3>

        <div className="space-y-5 mb-6"> {/* Added mb-6 for bottom margin */}
          {isLoading ? (
            Array(5).fill(0).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="ml-3">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          ) : (
            topClients?.map((client, index) => {
              const colorVariant = colorVariants[index % colorVariants.length];
              return (
                <div key={client.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-full ${colorVariant.bg} flex items-center justify-center ${colorVariant.text} text-xs font-medium`}>
                      {getInitials(client.name)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{client.type}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(client.revenue, currency)}
                  </p>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-center mt-5">
          <Link href="/clients">
            <button className="w-full py-2 text-sm font-medium text-[#3DAFC4] hover:text-[#3DAFC4]/80 dark:text-[#3DAFC4] dark:hover:text-[#3DAFC4]/90 transition">
              View All Clients
            </button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopClients;