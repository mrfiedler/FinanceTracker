import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
}

export function AnimatedContainer({ 
  children, 
  delay = 0, 
  className,
  ...props 
}: AnimatedContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: delay, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}