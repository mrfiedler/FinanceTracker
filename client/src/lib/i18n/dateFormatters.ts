import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Language } from "./translations";

/**
 * Format date according to the application's locale setting
 */
export const formatDate = (date: Date | string | null, formatString: string, language: Language): string => {
  if (!date) return "Invalid date";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    
    return format(dateObj, formatString, { 
      locale: getLocale(language) 
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

/**
 * Format relative time (e.g., "5 minutes ago") according to the application's locale setting
 */
export const formatRelativeTime = (date: Date | string | null, language: Language): string => {
  if (!date) return "Unknown time";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    
    return formatDistanceToNow(dateObj, { 
      addSuffix: true,
      locale: getLocale(language) 
    });
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "Unknown time";
  }
};

/**
 * Get appropriate locale for date-fns
 */
const getLocale = (language: Language) => {
  switch (language) {
    case "pt-BR":
      return ptBR;
    default:
      return undefined; // Default locale (English)
  }
};

/**
 * Format currency value according to the application's locale setting
 */
export const formatCurrency = (amount: number, currency: string, language: Language): string => {
  try {
    // Map language to locale for Intl.NumberFormat
    const localeMap: Record<Language, string> = {
      "en": "en-US",
      "pt-BR": "pt-BR"
    };
    
    const locale = localeMap[language] || "en-US";
    
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return `${currency} ${amount.toFixed(2)}`;
  }
};