import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star, TrendingUp, X } from 'lucide-react';

interface AchievementProps {
  title: string;
  message: string;
  type?: 'success' | 'milestone' | 'streak';
  show: boolean;
  onClose?: () => void;
  autoHideDuration?: number;
}

const typeConfig = {
  success: {
    icon: <Award className="h-10 w-10" />,
    iconColor: "text-yellow-400",
    bgGradient: "from-green-500 to-emerald-600",
    borderColor: "border-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.4)", // Emerald glow
  },
  milestone: {
    icon: <Star className="h-10 w-10" />,
    iconColor: "text-amber-300",
    bgGradient: "from-purple-500 to-indigo-600",
    borderColor: "border-purple-400",
    glowColor: "rgba(139, 92, 246, 0.4)", // Purple glow
  },
  streak: {
    icon: <TrendingUp className="h-10 w-10" />,
    iconColor: "text-blue-300",
    bgGradient: "from-blue-500 to-cyan-600",
    borderColor: "border-blue-400",
    glowColor: "rgba(59, 130, 246, 0.4)", // Blue glow
  }
};

const Achievement = ({ 
  title, 
  message, 
  type = 'success', 
  show, 
  onClose, 
  autoHideDuration = 5000 
}: AchievementProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const config = typeConfig[type];
  
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      if (autoHideDuration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          if (onClose) onClose();
        }, autoHideDuration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [show, autoHideDuration, onClose]);
  
  // Small sparkles that appear around the achievement
  const renderSparkles = () => {
    const sparkleCount = 8;
    
    return Array.from({ length: sparkleCount }).map((_, i) => {
      const delay = i * 0.1;
      const duration = 0.8 + Math.random() * 1;
      const size = 4 + Math.random() * 8;
      const angle = (i / sparkleCount) * 360;
      const distance = 60 + Math.random() * 20;
      
      const x = Math.cos(angle * (Math.PI / 180)) * distance;
      const y = Math.sin(angle * (Math.PI / 180)) * distance;
      
      return (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          style={{ width: size, height: size }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: x,
            y: y
          }}
          transition={{
            duration,
            delay,
            times: [0, 0.5, 1],
            repeat: Infinity,
            repeatDelay: Math.random() * 1
          }}
        />
      );
    });
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ 
            type: 'spring', 
            stiffness: 350, 
            damping: 25,
            duration: 0.5 
          }}
          className={`fixed bottom-5 right-5 bg-gradient-to-br ${config.bgGradient} rounded-xl shadow-2xl p-5 z-50 flex items-start space-x-4 max-w-md border-2 ${config.borderColor}`}
          style={{
            boxShadow: `0 0 20px 5px ${config.glowColor}`,
          }}
        >
          {/* Background effects */}
          <motion.div 
            className="absolute inset-0 rounded-xl overflow-hidden"
            style={{ zIndex: -1 }}
          >
            <motion.div 
              className="absolute inset-0 opacity-20 bg-white"
              initial={{ rotate: 0, scale: 0.8 }}
              animate={{ 
                rotate: 360, 
                scale: [0.8, 1.2, 0.8] 
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
              }}
              style={{
                backgroundImage: "radial-gradient(circle at 50% 50%, transparent 30%, white 70%)",
                filter: "blur(20px)"
              }}
            />
          </motion.div>
          
          {/* Icon container */}
          <div className="flex-shrink-0 relative">
            <motion.div
              initial={{ rotate: -30, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ 
                type: 'spring', 
                stiffness: 260, 
                damping: 20
              }}
            >
              <div className={`bg-white/20 backdrop-blur-sm p-3 rounded-full flex items-center justify-center relative`}>
                <motion.div
                  initial={{ opacity: 0.5, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`${config.iconColor}`}
                >
                  {config.icon}
                </motion.div>
                
                {/* Ring effect around icon */}
                <motion.div 
                  className="absolute inset-0 rounded-full"
                  initial={{ opacity: 0.7, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.8 }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeOut" 
                  }}
                  style={{ 
                    border: `2px solid ${config.iconColor.replace('text-', '')}`,
                    borderColor: 'white'
                  }}
                />
                
                {/* Sparkles around icon */}
                {renderSparkles()}
              </div>
            </motion.div>
          </div>
          
          {/* Content */}
          <div className="flex-1 pt-2">
            <motion.h3 
              className="font-bold text-xl text-white/90"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              {title}
            </motion.h3>
            <motion.p 
              className="text-white/80 text-sm mt-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {message}
            </motion.p>
          </div>
          
          {/* Close button */}
          <motion.button
            className="text-white/80 hover:text-white focus:outline-none absolute top-3 right-3"
            onClick={() => {
              setIsVisible(false);
              if (onClose) onClose();
            }}
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <X className="h-5 w-5" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Achievement;