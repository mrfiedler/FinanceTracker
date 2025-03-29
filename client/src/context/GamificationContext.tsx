import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import Confetti from '@/components/gamification/Confetti';
import Achievement from '@/components/gamification/Achievement';
import LevelUpAnimation from '@/components/gamification/LevelUpAnimation';
import { apiRequest } from '@/lib/queryClient';

type AchievementType = 'success' | 'milestone' | 'streak';

interface GamificationContextType {
  triggerConfetti: (duration?: number, count?: number) => void;
  showAchievement: (title: string, message: string, type?: AchievementType) => void;
  addPoints: (points: number) => void;
  earnBadge: (badgeId: string) => void;
  points: number;
  level: number;
  badges: string[];
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate level based on points with the new progression system
  const calculateLevel = (points: number): number => {
    // Level thresholds array: index is level-1, value is points required to reach that level
    const levelThresholds = [
      0,     // Level 1 (starting level)
      50,    // Level 2 requires 50 points
      150,   // Level 3 requires 150 points
      250,   // Level 4 requires 250 points
      400,   // Level 5 requires 400 points
      600,   // Level 6 requires 600 points
      800    // Level 7 requires 800 points
    ];
    
    // For levels beyond 7, each level requires 200 more points than the previous
    const level = levelThresholds.findIndex(threshold => points < threshold);
    
    if (level === -1) {
      // Calculate levels above 7
      const pointsAboveLevel7 = points - levelThresholds[levelThresholds.length - 1];
      const additionalLevels = Math.floor(pointsAboveLevel7 / 200) + 1;
      return levelThresholds.length + additionalLevels;
    }
    
    return level === 0 ? 1 : level;
  };
  
  // Load user's gamification data from the API
  useEffect(() => {
    const fetchGamificationData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user/gamification');
        
        if (response.ok) {
          const data = await response.json();
          setPoints(data.points);
          setBadges(data.badges);
        }
      } catch (error) {
        console.error('Failed to load gamification data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGamificationData();
  }, []);
  
  // Save gamification data to API when points or badges change
  useEffect(() => {
    // Skip initial load
    if (isLoading) return;
    
    const saveGamificationData = async () => {
      try {
        await fetch('/api/user/gamification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            level: calculateLevel(points),
            points,
            badges
          })
        });
      } catch (error) {
        console.error('Failed to save gamification data:', error);
      }
    };
    
    // Debounce to prevent too many API calls
    const debounceTimer = setTimeout(() => {
      saveGamificationData();
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [points, badges, isLoading]);
  
  const level = calculateLevel(points);
  
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
      
      // Check if user leveled up using our new level calculation
      const prevLevel = calculateLevel(prevPoints);
      const newLevel = calculateLevel(newPoints);
      
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
      
      // Award 200 points for earning a new badge level
      // This is done with a slight delay to ensure the UI updates in sequence
      setTimeout(() => {
        addPoints(200);
      }, 500);
      
      // Show achievement for new badge
      showAchievement(
        'New Badge Earned!', 
        `You've earned the ${badgeId} badge and gained 200 points!`, 
        'success'
      );
      
      return [...prev, badgeId];
    });
  }, [showAchievement, addPoints]);
  
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
    isLoading,
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