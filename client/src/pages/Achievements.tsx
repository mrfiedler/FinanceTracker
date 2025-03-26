import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGamification } from "@/context/GamificationContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Award, Star, Gift, Zap, Target, TrendingUp, Users, FileCheck, CreditCard, DollarSign } from "lucide-react";

// Define the quests and achievements
const quests = [
  {
    id: "new-client",
    name: "Client Acquisition",
    description: "Add new clients to grow your business",
    levels: [
      { level: 1, target: 1, reward: 20, description: "Add your first client" },
      { level: 2, target: 5, reward: 50, description: "Add 5 clients" },
      { level: 3, target: 10, reward: 100, description: "Add 10 clients" },
    ],
    icon: <Users className="h-5 w-5" />,
    color: "bg-blue-500"
  },
  {
    id: "send-quotes",
    name: "Quote Master",
    description: "Create and send quotes to potential clients",
    levels: [
      { level: 1, target: 1, reward: 10, description: "Send your first quote" },
      { level: 2, target: 5, reward: 30, description: "Send 5 quotes" },
      { level: 3, target: 20, reward: 80, description: "Send 20 quotes" },
    ],
    icon: <FileCheck className="h-5 w-5" />,
    color: "bg-purple-500"
  },
  {
    id: "convert-quotes",
    name: "Deal Closer",
    description: "Convert quotes into revenue",
    levels: [
      { level: 1, target: 1, reward: 15, description: "Close your first deal" },
      { level: 2, target: 3, reward: 40, description: "Close 3 deals" },
      { level: 3, target: 10, reward: 90, description: "Close 10 deals" },
    ],
    icon: <TrendingUp className="h-5 w-5" />,
    color: "bg-green-500"
  },
  {
    id: "revenue-milestone",
    name: "Revenue Milestones",
    description: "Achieve revenue targets",
    levels: [
      { level: 1, target: 1000, reward: 20, description: "Reach $1,000 in revenue" },
      { level: 2, target: 10000, reward: 50, description: "Reach $10,000 in revenue" },
      { level: 3, target: 50000, reward: 150, description: "Reach $50,000 in revenue" },
    ],
    icon: <DollarSign className="h-5 w-5" />,
    color: "bg-emerald-500"
  },
  {
    id: "contracts-signed",
    name: "Contract Pro",
    description: "Sign contracts with clients",
    levels: [
      { level: 1, target: 1, reward: 15, description: "Sign your first contract" },
      { level: 2, target: 3, reward: 35, description: "Sign 3 contracts" },
      { level: 3, target: 10, reward: 85, description: "Sign 10 contracts" },
    ],
    icon: <FileCheck className="h-5 w-5" />,
    color: "bg-amber-500"
  },
  {
    id: "subscriptions",
    name: "Recurring Revenue",
    description: "Set up subscription services",
    levels: [
      { level: 1, target: 1, reward: 25, description: "Create your first subscription" },
      { level: 2, target: 3, reward: 50, description: "Create 3 subscriptions" },
      { level: 3, target: 10, reward: 120, description: "Create 10 subscriptions" },
    ],
    icon: <CreditCard className="h-5 w-5" />,
    color: "bg-blue-600"
  }
];

// Define rewards that can be redeemed with points
const rewards = [
  {
    id: "eluvie-discount-10",
    name: "10% Eluvie Discount",
    description: "Redeem a 10% discount code for any Eluvie products",
    cost: 100,
    icon: <Gift className="h-5 w-5" />,
  },
  {
    id: "eluvie-discount-25",
    name: "25% Eluvie Discount",
    description: "Redeem a 25% discount code for any Eluvie products",
    cost: 250,
    icon: <Gift className="h-5 w-5" />,
  },
  {
    id: "eluvie-merch",
    name: "Eluvie Merchandise",
    description: "Redeem points for exclusive Eluvie branded merchandise",
    cost: 500,
    icon: <Gift className="h-5 w-5" />,
  },
  {
    id: "premium-template",
    name: "Premium Contract Template",
    description: "Unlock a premium contract template for your business",
    cost: 200,
    icon: <FileCheck className="h-5 w-5" />,
  },
  {
    id: "advanced-analytics",
    name: "Advanced Analytics",
    description: "Unlock advanced financial analytics and forecasting",
    cost: 300,
    icon: <TrendingUp className="h-5 w-5" />,
  }
];

const Achievements = () => {
  const { level, points, badges, addPoints, earnBadge, showAchievement, triggerConfetti } = useGamification();
  
  // Simulated progress for the quests (in a real app, this would come from actual user data)
  const [questProgress, setQuestProgress] = useState<Record<string, number>>({
    "new-client": 3,
    "send-quotes": 7,
    "convert-quotes": 2,
    "revenue-milestone": 8500,
    "contracts-signed": 1,
    "subscriptions": 0
  });
  
  // Demo function to simulate completing a quest
  const completeQuestLevel = (questId: string, levelIdx: number) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;
    
    const questLevel = quest.levels[levelIdx];
    setQuestProgress(prev => ({ ...prev, [questId]: questLevel.target }));
    addPoints(questLevel.reward);
    
    showAchievement(
      `${quest.name} - Level ${questLevel.level} Complete!`,
      `${questLevel.description}. Earned ${questLevel.reward} points!`,
      'success'
    );
    
    // Also earn a badge for the quest
    earnBadge(`${quest.name} Level ${questLevel.level}`);
  };
  
  // Function to redeem a reward
  const redeemReward = (reward: typeof rewards[0]) => {
    if (points >= reward.cost) {
      addPoints(-reward.cost);
      
      showAchievement(
        'Reward Redeemed!',
        `You've redeemed ${reward.name}. Check your email for details.`,
        'milestone'
      );
      
      // In a real app, this would trigger an API call to process the reward
    }
  };
  
  // Calculate progress for next level
  const nextLevelProgress = ((points % 100) / 100) * 100;
  const pointsToNextLevel = 100 - (points % 100);
  
  return (
    <main className="w-full h-full overflow-y-auto bg-background p-4 md:p-6 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Achievements</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Complete quests, earn points, and redeem exclusive rewards.
        </p>
      </div>
      
      {/* User Level Section */}
      <div className="mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Level {level}</CardTitle>
              <CardDescription>Your current progress</CardDescription>
            </div>
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <div className="flex justify-between mb-1 text-sm">
                <span>{points} points</span>
                <span>{points + pointsToNextLevel} points</span>
              </div>
              <Progress value={nextLevelProgress} max={100} className="h-2" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {pointsToNextLevel} points to level {level + 1}
              </p>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium text-sm mb-2">Your Badges</h3>
              <div className="flex flex-wrap gap-2">
                {badges.length > 0 ? (
                  badges.map((badge, index) => (
                    <Badge key={index} variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                      <Award className="h-3 w-3 mr-1" /> {badge}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Complete quests to earn badges.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quests Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quests.map((quest) => {
            const currentProgress = questProgress[quest.id] || 0;
            const currentLevel = quest.levels.findIndex(level => currentProgress < level.target);
            const completedAllLevels = currentLevel === -1;
            const activeLevel = completedAllLevels ? quest.levels.length - 1 : Math.max(0, currentLevel);
            const nextLevelTarget = quest.levels[activeLevel]?.target || 0;
            const progressPercent = completedAllLevels 
              ? 100 
              : (currentProgress / nextLevelTarget) * 100;
            
            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="h-full"
              >
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${quest.color}`}>
                        {quest.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{quest.name}</CardTitle>
                        <CardDescription className="text-xs mt-0">
                          {completedAllLevels ? 'All levels completed!' : `Level ${activeLevel + 1}`}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {quest.description}
                    </p>
                    
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{currentProgress}</span>
                        <span>{nextLevelTarget}</span>
                      </div>
                      <Progress value={progressPercent} max={100} className="h-1.5" />
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-xs font-medium mb-1">Current Goal:</h4>
                      <p className="text-sm">
                        {completedAllLevels 
                          ? "All levels completed!" 
                          : quest.levels[activeLevel]?.description}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    {!completedAllLevels && (
                      <Button 
                        size="sm" 
                        className="w-full"
                        variant="outline"
                        onClick={() => completeQuestLevel(quest.id, activeLevel)}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Complete {activeLevel + 1 > 0 ? `Level ${activeLevel + 1}` : 'First Level'}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Rewards Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{reward.name}</CardTitle>
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
                      {reward.icon}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {reward.description}
                  </p>
                  <div className="mt-4 flex items-center">
                    <DollarSign className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-bold">{reward.cost} points</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    size="sm" 
                    className="w-full"
                    disabled={points < reward.cost}
                    onClick={() => redeemReward(reward)}
                  >
                    Redeem Reward
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Achievements;