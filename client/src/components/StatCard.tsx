import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  changePercent: number;
  isPositiveChange: boolean;
  isLoading?: boolean;
  isCurrency?: boolean;
}

export default function StatCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  changePercent,
  isPositiveChange,
  isLoading = false,
  isCurrency = true
}: StatCardProps) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: isCurrency ? 'currency' : 'decimal',
    currency: 'USD',
    minimumFractionDigits: isCurrency ? 2 : 0,
    maximumFractionDigits: isCurrency ? 2 : 0,
  });

  const formattedValue = formatter.format(value);
  
  return (
    <div className="bg-[#1E1E1E] p-4 rounded-lg border border-[#333333]">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24 bg-gray-700 mt-1" />
          ) : (
            <h3 className="text-2xl font-semibold text-white mt-1">
              {formattedValue}
            </h3>
          )}
        </div>
        <div className={`p-2 ${iconBgColor} rounded-md`}>
          <i className={`${icon} ${iconColor}`}></i>
        </div>
      </div>
      <div className="mt-4 text-sm">
        <span className={isPositiveChange ? "text-green-500" : "text-red-500"}>
          <i className={`fas fa-arrow-${isPositiveChange ? 'up' : 'down'} mr-1`}></i>
          {changePercent}%
        </span>
        <span className="text-gray-400 ml-1">vs last month</span>
      </div>
    </div>
  );
}
