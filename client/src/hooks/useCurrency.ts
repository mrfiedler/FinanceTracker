
import { useQuery } from "@tanstack/react-query";

export function useCurrency() {
  const { data } = useQuery({
    queryKey: ["currency"],
    queryFn: async () => {
      const response = await fetch("/api/quotes/conversion");
      return response.json();
    },
  });

  return {
    conversionRate: data?.conversionRate ?? 1,
    currency: data?.currency ?? "USD",
  };
}
