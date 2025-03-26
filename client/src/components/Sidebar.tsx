import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users, 
  FileText, 
  DollarSign, 
  Repeat, 
  File, 
  Award, 
  Settings as SettingsIcon, 
  X,
  BarChart3
} from "lucide-react";
import Logo from "./Logo";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();
  
  const menuItems = [
    { href: "/", label: "Dashboard", icon: <Home className="h-[18px] w-[18px]" /> },
    { href: "/clients", label: "Clients", icon: <Users className="h-[18px] w-[18px]" /> },
    { href: "/quotes", label: "Quotes", icon: <FileText className="h-[18px] w-[18px]" /> },
    { href: "/finance", label: "Finance", icon: <DollarSign className="h-[18px] w-[18px]" /> },
    { href: "/subscriptions", label: "Subscriptions", icon: <Repeat className="h-[18px] w-[18px]" /> },
    { href: "/contracts", label: "Contracts", icon: <File className="h-[18px] w-[18px]" /> },
    { href: "/achievements", label: "Achievements", icon: <Award className="h-[18px] w-[18px]" /> },
    { href: "/settings", label: "Settings", icon: <SettingsIcon className="h-[18px] w-[18px]" /> },
  ];

  const containerVariants = {
    hidden: { x: -280 },
    visible: { x: 0, transition: { duration: 0.3, ease: "easeInOut" } }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        className={cn(
          "fixed top-0 bottom-0 z-20 w-64 lg:w-72 overflow-y-auto overflow-x-hidden", 
          "bg-background border-r border-border transition-transform",
          "flex flex-col pb-4 h-screen",
          !open && "lg:translate-x-0 -translate-x-full",
          open && "translate-x-0"
        )}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <Logo />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Navigation */}
        <div className="px-2 pt-4 pb-2">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all relative group",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                      layoutId="activeIndicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  
                  <span className={cn(
                    "text-lg transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    {item.icon}
                  </span>
                  
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Stats */}
        <div className="mt-auto px-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Quick Stats</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs">Total Revenue</span>
                <span className="text-xs font-medium">$24,350</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs">Quotes</span>
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-medium">21</span>
                  <span className="text-xs text-green-500">(+5)</span>
                </div>
              </div>
            </div>
            <Button variant="default" size="sm" className="w-full mt-3">
              <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
              View Reports
            </Button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
