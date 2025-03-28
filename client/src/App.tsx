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
import Notifications from "./pages/Notifications";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import { useEffect, useState } from "react";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import AuthPage from "./pages/auth-page";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function AppLayout({ children }: { children: React.ReactNode }) {
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
          {children}
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Regular app routes */}
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={() => (
        <AppLayout>
          <Dashboard />
        </AppLayout>
      )} />
      <ProtectedRoute path="/finance" component={() => (
        <AppLayout>
          <Finance />
        </AppLayout>
      )} />
      <ProtectedRoute path="/clients" component={() => (
        <AppLayout>
          <Clients />
        </AppLayout>
      )} />
      <ProtectedRoute path="/quotes" component={() => (
        <AppLayout>
          <Quotes />
        </AppLayout>
      )} />
      <ProtectedRoute path="/subscriptions" component={() => (
        <AppLayout>
          <Subscriptions />
        </AppLayout>
      )} />
      <ProtectedRoute path="/contracts" component={() => (
        <AppLayout>
          <Contracts />
        </AppLayout>
      )} />
      <ProtectedRoute path="/achievements" component={() => (
        <AppLayout>
          <Achievements />
        </AppLayout>
      )} />
      <ProtectedRoute path="/settings" component={() => (
        <AppLayout>
          <Settings />
        </AppLayout>
      )} />
      <ProtectedRoute path="/notifications" component={() => (
        <AppLayout>
          <Notifications />
        </AppLayout>
      )} />
      
      {/* Admin routes */}
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CurrencyProvider>
          <AuthProvider>
            <GamificationProvider>
              <Router />
              <Toaster />
            </GamificationProvider>
          </AuthProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
