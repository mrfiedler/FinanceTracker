import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Notification as SchemaNotification } from "@shared/schema";
import { format, formatDistanceToNow } from "date-fns";

// Avoid naming conflicts with the browser's Notification API
type AppNotification = {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
}
import { 
  Bell, Check, CheckCheck, Clock, AlertTriangle, 
  Filter, RefreshCw, Trash2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, CardContent, CardDescription, CardFooter, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const Notifications = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all"); // "all", "unread", "read"

  // Fetch notifications
  const { data: notifications = [], isLoading, refetch } = useQuery<AppNotification[]>({
    queryKey: ['/api/notifications'],
    staleTime: 30000 // 30 seconds
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('PATCH', `/api/notifications/${id}/mark-read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Notification marked as read",
        description: "The notification has been marked as read.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    }
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('PATCH', '/api/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "All notifications marked as read",
        description: "All notifications have been marked as read.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      });
    }
  });

  // Get filtered notifications
  const getFilteredNotifications = () => {
    switch (activeTab) {
      case "unread":
        return notifications.filter(n => !n.isRead);
      case "read":
        return notifications.filter(n => n.isRead);
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'level_up':
        return <Check className="h-5 w-5" />;
      case 'transaction_due':
        return <Clock className="h-5 w-5" />;
      case 'payment_received':
        return <CheckCheck className="h-5 w-5" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    switch(type) {
      case 'level_up':
        return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400';
      case 'transaction_due':
        return 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400';
      case 'payment_received':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400';
      case 'alert':
        return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  // Format notification date
  const formatNotificationDate = (date: string | Date | null) => {
    if (!date) {
      return {
        relative: 'Unknown date',
        full: 'Unknown date'
      };
    }
    
    try {
      const notificationDate = date instanceof Date ? date : new Date(date);
      return {
        relative: formatDistanceToNow(notificationDate, { addSuffix: true }),
        full: format(notificationDate, 'PPP p')
      };
    } catch (error) {
      return {
        relative: 'Unknown date',
        full: 'Unknown date'
      };
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Notifications | Finance Tracker</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Notifications</h1>
            <p className="text-muted-foreground">View and manage your notifications</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setActiveTab("all")}>
                  All notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("unread")}>
                  Unread notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("read")}>
                  Read notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all" className="relative">
              All
              <Badge className="ml-2 h-5 px-1.5 text-xs">{notifications.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="relative">
              Unread
              <Badge className="ml-2 h-5 px-1.5 text-xs">{unreadCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="read" className="relative">
              Read
              <Badge className="ml-2 h-5 px-1.5 text-xs">{notifications.length - unreadCount}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <NotificationsList 
              notifications={filteredNotifications} 
              isLoading={isLoading}
              markAsRead={id => markAsReadMutation.mutate(id)}
              getNotificationIcon={getNotificationIcon}
              getNotificationColor={getNotificationColor}
              formatNotificationDate={formatNotificationDate}
            />
          </TabsContent>
          
          <TabsContent value="unread" className="mt-0">
            <NotificationsList 
              notifications={filteredNotifications} 
              isLoading={isLoading}
              markAsRead={id => markAsReadMutation.mutate(id)}
              getNotificationIcon={getNotificationIcon}
              getNotificationColor={getNotificationColor}
              formatNotificationDate={formatNotificationDate}
            />
          </TabsContent>
          
          <TabsContent value="read" className="mt-0">
            <NotificationsList 
              notifications={filteredNotifications} 
              isLoading={isLoading}
              markAsRead={id => markAsReadMutation.mutate(id)}
              getNotificationIcon={getNotificationIcon}
              getNotificationColor={getNotificationColor}
              formatNotificationDate={formatNotificationDate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

interface NotificationsListProps {
  notifications: AppNotification[];
  isLoading: boolean;
  markAsRead: (id: number) => void;
  getNotificationIcon: (type: string) => React.ReactNode;
  getNotificationColor: (type: string) => string;
  formatNotificationDate: (date: string | Date | null) => { relative: string; full: string };
}

const NotificationsList = ({ 
  notifications, 
  isLoading,
  markAsRead,
  getNotificationIcon,
  getNotificationColor,
  formatNotificationDate
}: NotificationsListProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[170px]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-[85%]" />
            </CardContent>
            <CardFooter className="p-4 flex justify-between">
              <Skeleton className="h-3 w-[100px]" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No notifications</h3>
          <p className="text-muted-foreground text-center max-w-md">
            You don't have any notifications in this category at the moment. 
            Notifications will appear here as you interact with the platform.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {notifications.map((notification) => {
        const dates = formatNotificationDate(notification.createdAt);
        return (
          <Card 
            key={notification.id} 
            className={`overflow-hidden ${!notification.isRead ? 'ring-1 ring-primary/10' : ''}`}
          >
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full ${getNotificationColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div>
                  <CardTitle className="text-base">{notification.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {dates.relative}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm">{notification.message}</p>
            </CardContent>
            <CardFooter className="p-4 pt-2 flex justify-between items-center">
              <p className="text-xs text-muted-foreground" title={dates.full}>
                {dates.full}
              </p>
              {!notification.isRead && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => markAsRead(notification.id)}
                  title="Mark as read"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default Notifications;