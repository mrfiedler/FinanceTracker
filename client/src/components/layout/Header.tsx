import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Menu, Search, Bell, Sun, Moon, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

declare global {
  interface Window {
    toggleSidebar?: () => void;
  }
}

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSearch, setShowSearch] = useState(false);

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
                <Search className="h-4 w-4 text-gray-400 dark:text-[#b3b3b3]" />
              </div>
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 w-full rounded-lg text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
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
            
            {/* Notification button */}
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 relative"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
