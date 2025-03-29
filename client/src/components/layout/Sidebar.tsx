import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  DollarSign,
  Users,
  FileText,
  Bell,
  FileSignature,
  Settings,
  Trophy,
  Sparkles,
  Zap,
  X
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/context/ThemeContext";
import { useGamification } from "@/context/GamificationContext";
import { useLanguage } from "@/context/LanguageContext";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";

declare global {
  interface Window {
    toggleSidebar?: () => void;
  }
}

interface UserType {
  id?: number;
  username?: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
}

// We'll define navItems inside the Sidebar component to use the t function

// UserProfileSection component to display user information
interface UserProfileSectionProps {
  closeMobileSidebar: () => void;
}

const UserProfileSection = ({ closeMobileSidebar }: UserProfileSectionProps) => {
  const { data: userData, isLoading } = useQuery<UserType | null>({
    queryKey: ['/api/user'],
    retry: false,
  });

  const user = userData || {};

  // Generate initials from name
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex items-center space-x-3">
      {isLoading ? (
        <>
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        </>
      ) : user ? (
        <>
          <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-700">
            <AvatarImage 
              src={user.avatar} 
              alt={user.name || "User"} 
            />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-[#e6e6e6] truncate">
              {user.name || "User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-[#b3b3b3] truncate">
              {user.email || "user@example.com"}
            </p>
          </div>
        </>
      ) : (
        <>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              U
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-[#e6e6e6] truncate">
              Guest User
            </p>
            <p className="text-xs text-gray-500 dark:text-[#b3b3b3] truncate">
              Not logged in
            </p>
          </div>
        </>
      )}
      <Link
        href="/settings"
        onClick={closeMobileSidebar}
        className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:text-[#b3b3b3] dark:hover:text-[#e6e6e6]"
      >
        <Settings className="h-5 w-5" />
      </Link>
    </div>
  );
};

const Sidebar = () => {
  const [location] = useLocation();
  const { theme } = useTheme();
  const { level, points } = useGamification();
  const { t } = useLanguage();
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const prevLevelRef = useRef(level);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(!isMobile);
  
  // Define navItems with translations
  const navItems: Array<{ href: string; label: string; icon: React.ReactNode }> = [
    { href: "/", label: t('nav.dashboard'), icon: <Home className="h-5 w-5 mr-3" /> },
    { href: "/finance", label: t('nav.finance'), icon: <DollarSign className="h-5 w-5 mr-3" /> },
    { href: "/clients", label: t('nav.clients'), icon: <Users className="h-5 w-5 mr-3" /> },
    { href: "/quotes", label: t('nav.quotes'), icon: <FileText className="h-5 w-5 mr-3" /> },
    { href: "/subscriptions", label: t('nav.subscriptions'), icon: <Bell className="h-5 w-5 mr-3" /> },
    { href: "/contracts", label: t('nav.contracts'), icon: <FileSignature className="h-5 w-5 mr-3" /> },
  ];
  
  // Check for level change and trigger animation
  useEffect(() => {
    if (prevLevelRef.current !== level && prevLevelRef.current > 0) {
      setShowLevelUpAnimation(true);
      const timer = setTimeout(() => {
        setShowLevelUpAnimation(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    prevLevelRef.current = level;
  }, [level]);
  
  // Handle window resize events
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Automatically show sidebar on desktop, hide on mobile
      if (!mobile && !isOpen) {
        setIsOpen(true);
      } else if (mobile && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Handle ESC key to close sidebar on mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobile && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isOpen]);

  // Update sidebar DOM element when open state changes
  useEffect(() => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      if (isOpen) {
        sidebar.classList.remove('-translate-x-full');
      } else {
        sidebar.classList.add('-translate-x-full');
      }
    }
  }, [isOpen]);
  
  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Control sidebar visibility globally
  window.toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}
      
      <aside 
        id="sidebar" 
        className={`fixed z-20 h-full bg-white dark:bg-[#2e2e2e] shadow-lg w-64 transition-transform duration-300 ease-in-out 
                  md:translate-x-0 ${isOpen ? '' : '-translate-x-full'} 
                  border-r border-gray-200 dark:border-[#3d3d3d]`}
        aria-label="Sidebar"
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-[#3d3d3d]">
          <img 
            src={theme === 'dark' ? '/images/logo-dark.png' : '/images/logo-light.png'} 
            alt="Eluvie Logo" 
            className="h-8" 
          />
          
          {/* Close button for mobile */}
          {isMobile && (
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"
              onClick={closeMobileSidebar}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav 
          className="flex flex-col h-[calc(100vh-16rem)] mt-5 px-4 overflow-y-auto"
          aria-label="Main navigation"
        >
          <div className="space-y-1">
            {navItems.map((item: { href: string; label: string; icon: React.ReactNode }, index: number) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.3
                }}
                whileHover={{ 
                  scale: 1.03, 
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href={item.href}
                  onClick={closeMobileSidebar}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition",
                    location === item.href
                      ? "bg-primary/10 text-primary font-medium dark:text-[#e6e6e6] dark:bg-gray-800/50"
                      : "text-gray-700 hover:bg-gray-100 dark:text-[#e6e6e6] dark:hover:bg-gray-800"
                  )}
                >
                  {item.icon}
                  {item.label}
                  {location === item.href && (
                    <motion.div
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

          <div className="mt-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-4 mb-3">
              {t('nav.arcade')}
            </h3>

            <div className="mb-3 px-4 relative">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatType: "reverse", 
                      duration: 2 
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-[#F0CE8D] mr-1" />
                  </motion.div>
                  <span className="text-xs font-medium">{t('achievements.level')} {level}</span>
                </div>
                <motion.span 
                  className="text-xs font-medium bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-300"
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 1.5 
                  }}
                >
                  {points} {t('achievements.points')}
                </motion.span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <motion.div 
                  className={`h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full ${showLevelUpAnimation ? 'pulse-highlight' : ''}`}
                  initial={{ width: "2%" }}
                  animate={{ 
                    width: `${Math.max(2, points % 100)}%`,
                    boxShadow: showLevelUpAnimation ? "0 0 10px 2px rgba(236, 72, 153, 0.7)" : "none"
                  }}
                  transition={{ 
                    duration: 0.7,
                    ease: "easeOut"
                  }}
                ></motion.div>
              </div>
              
              {/* Animated notification when level up occurs */}
              <AnimatePresence>
                {showLevelUpAnimation && (
                  <motion.div 
                    className="absolute -top-4 left-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-md z-10"
                    initial={{ opacity: 0, y: 10, x: "-50%" }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      scale: [1, 1.2, 1]
                    }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ 
                      duration: 0.3,
                      scale: {
                        repeat: 3,
                        duration: 0.5
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {t('achievements.levelUp')}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              whileHover={{ 
                scale: 1.03,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href="/achievements"
                onClick={closeMobileSidebar}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition",
                  location === "/achievements"
                    ? "bg-primary/10 text-primary dark:text-[#e6e6e6] dark:bg-gray-800/50"
                    : "text-gray-700 hover:bg-gray-100 dark:text-[#e6e6e6] dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400"
                )}
              >
                <Trophy className="h-5 w-5 mr-3 text-[#F0CE8D]" />
                <span className="relative">
                  {t('nav.achievements')}
                  {location !== "/achievements" && (
                    <motion.span
                      className="absolute -top-1 -right-1 flex h-3 w-3"
                    >
                      <motion.span 
                        className="absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 2
                        }}
                      ></motion.span>
                      <motion.span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></motion.span>
                    </motion.span>
                  )}
                </span>
                {location === "/achievements" && (
                  <motion.div
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            </motion.div>
          </div>
        </nav>

        <div className="absolute bottom-0 w-full border-t border-gray-200 dark:border-[#3d3d3d] px-4 py-4">
          <UserProfileSection closeMobileSidebar={closeMobileSidebar} />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;