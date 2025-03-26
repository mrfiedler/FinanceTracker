import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Declare global window interface for TypeScript
declare global {
  interface Window {
    toggleSidebar?: () => void;
    openAddSubscriptionModal?: () => void;
  }
}

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Make window object available to other components
  useEffect(() => {
    window.toggleSidebar = toggleSidebar;
  }, []);

  // Attaching click handler to close mobile sidebar when clicking outside
  const handleContentClick = () => {
    if (sidebarOpen && isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Overlay for mobile when sidebar is open */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black z-10"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-1">
        {/* Sidebar with improved animation */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content container */}
        <div className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
          sidebarOpen && "lg:pl-0"
        )}>
          {/* Header with shadow and better spacing */}
          <Header toggleSidebar={toggleSidebar} />

          {/* Main Content with improved scrolling - removed height restrictions */}
          <main 
            className="flex-1 overflow-y-auto bg-background transition-colors duration-300 relative max-h-[calc(100vh-64px)]"
            onClick={handleContentClick}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
