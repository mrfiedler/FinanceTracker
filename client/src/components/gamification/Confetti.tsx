import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  active: boolean;
  duration?: number; // ms
  count?: number;
  onComplete?: () => void;
  focusPoint?: { x: number; y: number }; // Optional focal point for the confetti
}

// More vibrant, modern color palette
const colors = [
  '#FF5ACD', // Pink
  '#5271FF', // Blue
  '#FFC700', // Gold
  '#7B61FF', // Purple
  '#1EBEA5', // Teal
  '#FF8A65', // Coral
];

// Particle shapes - array of SVG paths for different confetti shapes
const shapes = [
  "M0,0 L5,10 L10,0 L5,-10 Z", // Diamond
  "M0,0 L10,0 L10,10 L0,10 Z", // Square
  "M5,0 C8,0 10,2 10,5 C10,8 8,10 5,10 C2,10 0,8 0,5 C0,2 2,0 5,0 Z", // Circle
  "M0,0 L5,10 L10,0 Z", // Triangle
  "M0,5 L5,0 L10,5 L5,10 Z", // Diamond 2
];

interface Particle {
  id: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
  shape: string;
  scale: number;
  velocity: {
    x: number;
    y: number;
    rotation: number;
  };
}

const Confetti = ({ 
  active, 
  duration = 3000, 
  count = 150, 
  onComplete,
  focusPoint 
}: ConfettiProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  useEffect(() => {
    if (active) {
      // Default center of screen if no focus point
      const center = focusPoint || { 
        x: window.innerWidth / 2, 
        y: window.innerHeight / 2 
      };
      
      // Convert to percentage for responsive positioning
      const centerPctX = (center.x / window.innerWidth) * 100;
      const centerPctY = (center.y / window.innerHeight) * 100;
      
      const newParticles = Array.from({ length: count }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2; // Random angle in radians (360 degrees)
        const speed = 5 + Math.random() * 15; // Random speed
        
        return {
          id: i,
          x: centerPctX + (Math.random() - 0.5) * 15, // Cluster around center point
          y: centerPctY + (Math.random() - 0.5) * 15, // Cluster around center point
          rotate: Math.random() * 360,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          scale: 0.5 + Math.random() * 1.5, // Random size
          velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
            rotation: (Math.random() - 0.5) * 15 // Random rotation speed
          }
        };
      });
      
      setParticles(newParticles);
      
      // Clear confetti after duration
      if (duration) {
        const timer = setTimeout(() => {
          setParticles([]);
          if (onComplete) onComplete();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setParticles([]);
    }
  }, [active, count, duration, onComplete, focusPoint]);
  
  if (!active && !particles.length) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: `${particle.x}%`,
              y: `${particle.y}%`,
              rotate: particle.rotate,
              scale: 0,
              opacity: 0
            }}
            animate={{ 
              x: `calc(${particle.x}% + ${particle.velocity.x * 5}vw)`,
              y: `calc(${particle.y}% + ${particle.velocity.y * 5}vh)`,
              rotate: particle.rotate + particle.velocity.rotation * 50,
              scale: particle.scale,
              opacity: 1
            }}
            exit={{ 
              opacity: 0,
              scale: 0,
              transition: { duration: 0.5 }
            }}
            transition={{ 
              type: "spring",
              damping: 15,
              stiffness: 20,
              duration: duration / 1000,
            }}
            style={{
              position: 'absolute',
              width: '12px',
              height: '12px',
              filter: `drop-shadow(0 0 2px ${particle.color}88)`,
            }}
          >
            {/* Using SVG for more interesting shapes */}
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 10 10"
              fill={particle.color}
            >
              <path d={particle.shape} />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Confetti;