import React, { useState } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ButtonProps } from '@/components/ui/button';

interface AnimatedButtonProps extends ButtonProps {
  animateClick?: boolean;
  pulseEffect?: boolean;
  hoverScale?: number;
  tapScale?: number;
  glowEffect?: boolean;
  shimmerEffect?: boolean;
  particleEffect?: boolean;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    children, 
    animateClick = true, 
    pulseEffect = false,
    hoverScale = 1.05,
    tapScale = 0.95,
    glowEffect = false,
    shimmerEffect = false,
    particleEffect = false,
    ...props 
  }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    
    // For gradient shimmer effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const { currentTarget, clientX, clientY } = e;
      const { left, top } = currentTarget.getBoundingClientRect();
      
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    };
    
    // For particle effect on click
    const [particles, setParticles] = useState<Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      color: string;
      angle: number;
      speed: number;
    }>>([]);
    
    const createParticles = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!particleEffect) return;
      
      const { currentTarget, clientX, clientY } = e;
      const { left, top } = currentTarget.getBoundingClientRect();
      const x = clientX - left;
      const y = clientY - top;
      
      const colors = ['#FF5ACD', '#5271FF', '#FFC700', '#7B61FF', '#1EBEA5'];
      const newParticles = Array.from({ length: 10 }).map((_, i) => ({
        id: Date.now() + i,
        x,
        y,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 3 + 2
      }));
      
      setParticles(prev => [...prev, ...newParticles]);
      
      // Clean up particles after animation
      setTimeout(() => {
        setParticles(prev => 
          prev.filter(particle => !newParticles.some(p => p.id === particle.id))
        );
      }, 1000);
    };
    
    return (
      <motion.div
        whileHover={{ scale: hoverScale }}
        whileTap={animateClick ? { scale: tapScale } : undefined}
        className={`relative isolate ${shimmerEffect ? 'overflow-hidden' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseMove={shimmerEffect ? handleMouseMove : undefined}
        onClick={particleEffect ? createParticles : undefined}
      >
        {/* Pulse effect */}
        {pulseEffect && (
          <motion.div
            className="absolute inset-0 rounded-md bg-primary/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, 0.5, 0], 
              scale: [0.8, 1.2, 1.4] 
            }}
            transition={{ 
              repeat: Infinity,
              duration: 2,
              repeatDelay: 0.5
            }}
          />
        )}
        
        {/* Shimmer effect - moving gradient on hover */}
        {shimmerEffect && isHovered && (
          <motion.div 
            className="absolute inset-0 -z-10 opacity-70 rounded-md overflow-hidden"
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  180px circle at ${mouseX}px ${mouseY}px,
                  rgba(255, 255, 255, 0.3),
                  transparent 80%
                )
              `,
            }}
          />
        )}
        
        {/* Glow effect on hover */}
        {glowEffect && (
          <motion.div
            className="absolute inset-0 -z-10 rounded-md"
            initial={{ boxShadow: "0 0 0px 0px rgba(var(--primary), 0)" }}
            animate={{ 
              boxShadow: isHovered
                ? "0 0 20px 2px rgba(var(--primary), 0.3)"
                : "0 0 0px 0px rgba(var(--primary), 0)"
            }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Particle effect */}
        {particleEffect && particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              x: particle.x,
              y: particle.y,
            }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{
              x: particle.x + Math.cos(particle.angle) * particle.speed * 40,
              y: particle.y + Math.sin(particle.angle) * particle.speed * 40,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        ))}
        
        <Button 
          ref={ref} 
          {...props}
          className={`${props.className || ''} relative ${
            isPressed && animateClick ? 'translate-y-[1px]' : ''
          }`}
        >
          {children}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

export default AnimatedButton;