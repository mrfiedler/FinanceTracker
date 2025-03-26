import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "./context/ThemeContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { GamificationProvider } from "./context/GamificationContext";
import Dashboard from "./pages/Dashboard";
import Finance from "./pages/Finance";
import Clients from "./pages/Clients";
import Quotes from "./pages/Quotes";
import Subscriptions from "./pages/Subscriptions";
import Contracts from "./pages/Contracts";
import Achievements from "./pages/Achievements";
import Settings from "./pages/Settings";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import { useEffect, useState } from "react";

function Router() {
  // Track viewport size for responsive adjustments
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine if mobile layout should be used
  const isMobile = windowWidth < 768;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar with overlay effect on mobile */}
      <Sidebar />
      
      {/* Main content area with responsive margin and safe area insets */}
      <div 
        className="flex-1 flex flex-col h-screen w-full overflow-hidden transition-all duration-300 ease-in-out" 
        style={{ 
          marginLeft: isMobile ? '0' : '16rem',  // 64px = 16rem (sidebar width) 
        }}
      >
        <Header />
        <div className="flex-1 overflow-hidden">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/finance" component={Finance} />
            <Route path="/clients" component={Clients} />
            <Route path="/quotes" component={Quotes} />
            <Route path="/subscriptions" component={Subscriptions} />
            <Route path="/contracts" component={Contracts} />
            <Route path="/achievements" component={Achievements} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CurrencyProvider>
          <GamificationProvider>
            <Router />
            <Toaster />
          </GamificationProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
