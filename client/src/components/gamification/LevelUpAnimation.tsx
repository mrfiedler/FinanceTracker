import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface LevelUpAnimationProps {
  active: boolean;
  level: number;
  onComplete?: () => void;
}

const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({ active, level, onComplete }) => {
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    if (active) {
      setIsActive(true);
      
      // Shorter animation duration
      const timer = setTimeout(() => {
        setIsActive(false);
        if (onComplete) onComplete();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);
  
  if (!isActive) return null;
  
  return (
    <AnimatePresence>
      {isActive && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {/* Subtle glowing background - reduced opacity */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Level number with simplified animation */}
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full max-w-[100px] mx-auto"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.div 
              className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-pink-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {level}
            </motion.div>
            
            <motion.div
              className="text-xs font-medium text-white mt-1 bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 rounded-full flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Sparkles className="h-3 w-3 mr-1 text-yellow-300" />
              <span className="whitespace-nowrap">Level Up!</span>
            </motion.div>
          </motion.div>
          
          {/* Fewer particles */}
          <Particles />
        </div>
      )}
    </AnimatePresence>
  );
};

// Particle animation component - reduced and simplified
const Particles = () => {
  // Reduced particle count with responsive consideration
  const particleCount = 8;
  const colors = ['#FFEF5A', '#FF4C94', '#A45DFF'];
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(particleCount)].map((_, i) => {
        const size = Math.random() * 5 + 3; // Smaller particles
        const color = colors[Math.floor(Math.random() * colors.length)];
        // More centralized starting positions for better visibility on small screens
        const xPos = 30 + Math.random() * 40; // 30% to 70% of width
        
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: color,
              left: `${xPos}%`,
              top: '50%',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              y: [0, -20 - Math.random() * 20], // Smaller vertical movement
              x: [0, (Math.random() - 0.5) * 20], // Smaller horizontal drift
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 0.8 + Math.random() * 0.4, // Slightly faster animation
              ease: "easeOut",
            }}
          />
        );
      })}
    </div>
  );
};

export default LevelUpAnimation;