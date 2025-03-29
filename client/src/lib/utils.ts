import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Debounce function to limit rate of function calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Format currency based on selected currency type
export function formatCurrency(amount: number, currency: string, showSymbol = true): string {
  const options: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  // If we don't want to show the symbol, just use decimal style
  if (!showSymbol) {
    options.style = "decimal";
  }

  return new Intl.NumberFormat("en-US", options).format(amount);
}

// Format date to a readable format
export function formatDate(dateString: string): string {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long", 
      day: "numeric"
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
}

// Get initials from a name
export function getInitials(name: string): string {
  if (!name) return "??";
  
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Generate a random color from a predefined set based on id
export function getRandomColor(id: number): string {
  const colors = [
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300",
    "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
    "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
    "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
    "bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300",
    "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300",
    "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
  ];
  
  return colors[id % colors.length];
}

// Format percentage with two decimal places
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

// Generate a range of months or days for chart data
export function generateDateRange(periodicity: string, count: number): string[] {
  const today = new Date();
  const result: string[] = [];
  
  if (periodicity === 'monthly') {
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      result.push(date.toLocaleString('default', { month: 'short' }));
    }
  } else if (periodicity === 'weekly') {
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(today.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
      result.push(`W${Math.ceil(date.getDate() / 7)}`);
    }
  } else {
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
      result.push(date.getDate().toString());
    }
  }
  
  return result;
}
