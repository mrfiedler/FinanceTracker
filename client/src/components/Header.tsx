import { useState } from "react";
import { Bell, User, Search, Menu, Calendar, Sun, Moon, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderProps = {
  toggleSidebar: () => void;
};

export default function Header({ toggleSidebar }: HeaderProps) {
  const [searchActive, setSearchActive] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  
  return (
    <header className="sticky top-0 z-30 bg-card backdrop-blur-sm border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Left section with menu and logo */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleSidebar}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <h1 className="text-xl font-bold text-primary hidden md:block">Eluvie</h1>
        </div>
        
        {/* Search bar */}
        <AnimatePresence>
          {searchActive ? (
            <motion.div 
              className="absolute left-0 right-0 top-0 z-40 px-4 sm:px-6 lg:px-8 bg-card/95 backdrop-blur-md border-b border-border h-16 flex items-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center w-full max-w-md mx-auto">
                <Search className="h-4 w-4 mr-3 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent border-none outline-none flex-1 h-10 text-foreground"
                  autoFocus
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSearchActive(false)}
                  className="text-muted-foreground"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        
        {/* Right section with actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden sm:flex"
            onClick={() => setSearchActive(true)}
            aria-label="Search"
          >
            <Search className="h-[18px] w-[18px]" />
          </Button>
          
          {/* Calendar */}
          <Button 
            variant="ghost" 
            size="icon"
            className="hidden sm:flex"
            aria-label="Calendar"
          >
            <Calendar className="h-[18px] w-[18px]" />
          </Button>
          
          {/* Theme toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="relative"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDark ? "dark" : "light"}
                initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: 30 }}
                transition={{ duration: 0.2 }}
              >
                {isDark ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
              </motion.div>
            </AnimatePresence>
          </Button>
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-[18px] w-[18px]" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-primary text-white text-xs">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {["New quote request", "Payment received", "Contract signed"].map((notification, i) => (
                  <DropdownMenuItem key={i} className="cursor-pointer p-3 h-auto">
                    <div className="flex gap-3 items-start">
                      <div className="h-2 w-2 mt-1.5 rounded-full bg-primary" />
                      <div>
                        <p className="font-medium text-sm">{notification}</p>
                        <p className="text-xs text-muted-foreground">Just now</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center">
                <Button variant="ghost" size="sm" className="w-full">View all</Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative ml-1">
                <div className="h-8 w-8 rounded-full bg-primary/10 border border-border flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive">
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
