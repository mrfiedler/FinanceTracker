import React, { createContext, useState, useContext, ReactNode } from "react";
import { Language, translations } from "@/lib/i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const defaultLanguage: Language = 'en';

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => key,
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Initialize state with user's browser language or default to English
  const getBrowserLanguage = (): Language => {
    const browserLang = navigator.language;
    if (browserLang.startsWith('pt')) {
      return 'pt-BR';
    }
    return 'en'; // Default to English for all other languages
  };

  const [language, setLanguageState] = useState<Language>(
    () => {
      // Try to get previously set language from localStorage
      const savedLanguage = localStorage.getItem('preferredLanguage') as Language | null;
      return savedLanguage || getBrowserLanguage();
    }
  );

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    // Save to localStorage for persistence
    localStorage.setItem('preferredLanguage', newLanguage);
  };

  // Translation function that gets a string based on the current language
  const t = (key: string): string => {
    // Check if key exists in translation dictionary
    if (translations[key]) {
      return translations[key][language];
    }

    // If key doesn't exist, return the key itself as fallback
    console.warn(`Translation key not found: ${key}`);
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// We don't need to export the context directly as we use the hook