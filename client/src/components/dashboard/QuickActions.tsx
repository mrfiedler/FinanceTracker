import { PlusCircle, Zap, Sparkles } from "lucide-react";
import { useModals } from "@/hooks/useModals";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
// Keep the import but don't use the points functionality
import { useGamification } from "@/context/GamificationContext";

const QuickActions = () => {
  const { 
    openAddExpenseModal, 
    openAddRevenueModal, 
    openAddSubscriptionModal, 
    openCreateQuoteModal
  } = useModals();
  
  // Import but don't use this
  const { addPoints } = useGamification();

  // Define the action buttons with their properties (updated order as requested)
  const actions = [
    { 
      label: "Add Revenue", 
      color: "border-[#A3E635]", 
      bgColor: "hover:bg-[#F7FEE7]",
      darkBgColor: "dark:hover:bg-[#1F2A13]",
      textColor: "text-[#A3E635]", 
      onClick: openAddRevenueModal,
      id: "revenue-action",
      icon: <PlusCircle className="h-5 w-5 mr-2" />
    },
    { 
      label: "Add Expense", 
      color: "border-[#C6909A]", 
      bgColor: "hover:bg-[#FEF2F2]",
      darkBgColor: "dark:hover:bg-[#3A1C1C]",
      textColor: "text-[#C6909A]", 
      onClick: openAddExpenseModal,
      id: "expense-action",
      icon: <PlusCircle className="h-5 w-5 mr-2" />
    },
    { 
      label: "Create Quote", 
      color: "border-[#3DAFC4]", 
      bgColor: "hover:bg-[#F0F9FF]",
      darkBgColor: "dark:hover:bg-[#0F2231]",
      textColor: "text-[#3DAFC4]", 
      onClick: openCreateQuoteModal,
      id: "quote-action",
      icon: <Zap className="h-5 w-5 mr-2" />
    },
    { 
      label: "Add Subscription", 
      color: "border-[#7D6BA7]", 
      bgColor: "hover:bg-[#F5F3FB]",
      darkBgColor: "dark:hover:bg-[#2D2542]",
      textColor: "text-[#7D6BA7]", 
      onClick: openAddSubscriptionModal,
      id: "subscription-action",
      icon: <Sparkles className="h-5 w-5 mr-2" />
    }
  ];

  useEffect(() => {
    console.log("QuickActions loaded");
  }, []);

  // Button animation variants
  const buttonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut"
      }
    }),
    hover: { 
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: { 
      scale: 0.95,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 15 
      }
    }
  };

  // Icon animation variants
  const iconVariants = {
    initial: { rotate: 0 },
    hover: { 
      rotate: [0, -10, 10, -10, 0],
      transition: { 
        repeat: Infinity,
        repeatDelay: 1,
        duration: 1
      }
    }
  };

  return (
    <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {actions.map((action, index) => (
        <motion.div
          key={index}
          custom={index}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          className="arcade-button"
        >
          <motion.button
            id={action.id}
            onClick={(e) => {
              e.preventDefault();
              // Just trigger the modal without adding points
              action.onClick();
            }}
            type="button"
            className={`w-full flex items-center justify-center sm:justify-start py-3 px-3 sm:px-4 bg-white dark:bg-[#242424] 
              rounded-lg shadow-sm transition-all duration-150
              border-l-4 ${action.color} cursor-pointer
              focus:outline-none outline-none focus:ring-0 focus-visible:ring-0
              relative overflow-hidden ${action.bgColor} ${action.darkBgColor}`}
            aria-label={action.label}
          >
            <span className={`${action.textColor} flex-shrink-0`}>
              {action.icon}
            </span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
              {/* Responsive text for mobile screens */}
              <span className="hidden sm:inline">{action.label}</span>
              <span className="sm:hidden">
                {action.label.replace('Add ', '').replace('Create ', '')}
              </span>
            </span>
            
            {/* Pixel particle effect on click */}
            <motion.span
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              whileTap={{ 
                opacity: [0, 0.5, 0],
                scale: [0.8, 1.2, 1.5],
                transition: { duration: 0.4 }
              }}
            >
              <span className="absolute inset-0 bg-current opacity-10"></span>
            </motion.span>
          </motion.button>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickActions;