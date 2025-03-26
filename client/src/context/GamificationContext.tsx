import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Confetti from '@/components/gamification/Confetti';
import Achievement from '@/components/gamification/Achievement';
import LevelUpAnimation from '@/components/gamification/LevelUpAnimation';

type AchievementType = 'success' | 'milestone' | 'streak';

interface GamificationContextType {
  triggerConfetti: (duration?: number, count?: number) => void;
  showAchievement: (title: string, message: string, type?: AchievementType) => void;
  addPoints: (points: number) => void;
  earnBadge: (badgeId: string) => void;
  points: number;
  level: number;
  badges: string[];
}

interface GamificationProviderProps {
  children: ReactNode;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<GamificationProviderProps> = ({ children }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiConfig, setConfettiConfig] = useState({ duration: 2000, count: 100 });
  
  const [achievement, setAchievement] = useState({
    show: false,
    title: '',
    message: '',
    type: 'success' as AchievementType,
  });
  
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  
  // Calculate level based on points (1 level per 100 points)
  const level = Math.floor(points / 100) + 1;
  
  const triggerConfetti = useCallback((duration = 2000, count = 100) => {
    setConfettiConfig({ duration, count });
    setShowConfetti(true);
  }, []);
  
  const showAchievement = useCallback((title: string, message: string, type: AchievementType = 'success') => {
    setAchievement({
      show: true,
      title,
      message,
      type,
    });
    
    // Show confetti for achievements
    triggerConfetti();
  }, [triggerConfetti]);
  
  const addPoints = useCallback((pointsToAdd: number) => {
    setPoints(prevPoints => {
      const newPoints = prevPoints + pointsToAdd;
      
      // Check if user leveled up
      const prevLevel = Math.floor(prevPoints / 100) + 1;
      const newLevel = Math.floor(newPoints / 100) + 1;
      
      if (newLevel > prevLevel) {
        // Show achievement notification
        showAchievement(
          'Level Up!', 
          `Congratulations! You've reached level ${newLevel}`, 
          'milestone'
        );
        
        // Activate level up animation in sidebar
        setShowLevelUpAnimation(true);
        
        // More dramatic effects for bigger level jumps
        if (newLevel - prevLevel > 1) {
          triggerConfetti(3000, 200); // More confetti for multi-level jumps
        }
      }
      
      return newPoints;
    });
  }, [showAchievement, triggerConfetti]);
  
  const earnBadge = useCallback((badgeId: string) => {
    setBadges(prev => {
      if (prev.includes(badgeId)) return prev;
      
      // Show achievement for new badge
      showAchievement(
        'New Badge Earned!', 
        `You've earned the ${badgeId} badge`, 
        'success'
      );
      
      return [...prev, badgeId];
    });
  }, [showAchievement]);
  
  const closeAchievement = useCallback(() => {
    setAchievement(prev => ({ ...prev, show: false }));
  }, []);
  
  const value = {
    triggerConfetti,
    showAchievement,
    addPoints,
    earnBadge,
    points,
    level,
    badges,
  };
  
  return (
    <GamificationContext.Provider value={value}>
      {children}
      
      <Confetti 
        active={showConfetti} 
        duration={confettiConfig.duration} 
        count={confettiConfig.count}
        onComplete={() => setShowConfetti(false)}
      />
      
      <Achievement
        title={achievement.title}
        message={achievement.message}
        type={achievement.type}
        show={achievement.show}
        onClose={closeAchievement}
      />
      
      {/* We don't need to render the LevelUpAnimation here since it's rendered in the Sidebar
          But we would add it here if we wanted global level up animations */}
    </GamificationContext.Provider>
  );
};

export const useGamification = (): GamificationContextType => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};