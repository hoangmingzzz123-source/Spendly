import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { remindersApi, budgetsApi, goalsApi } from '../../lib/api';
import { useStore } from '../../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Bell, BellOff, Check, X, AlertTriangle, TrendingUp, Target, Calendar, Info } from 'lucide-react';
import { Link } from 'react-router';

interface Notification {
  id: string;
  type: 'reminder' | 'budget' | 'goal' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLink?: string;
}

export function Notifications() {
  const { currentMonth, user, accessToken } = useStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch data for notifications
  const { data: remindersData } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => remindersApi.getAll(),
    enabled: !!accessToken,
  });

  const { data: budgetsData } = useQuery({
    queryKey: ['budgets', currentMonth],
    queryFn: () => budgetsApi.getAll(currentMonth),
    enabled: !!accessToken,
  });

  const { data: goalsData } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsApi.getAll(),
    enabled: !!accessToken,
  });

  const reminders = remindersData?.data || [];
  const budgets = budgetsData?.data || [];
  const goals = goalsData?.data || [];

  // Generate notifications
  useEffect(() => {
    const newNotifications: Notification[] = [];

    // Budget notifications
    budgets.forEach((budget: any) => {
      if (budget.percentage >= 90 && budget.percentage < 100) {
        newNotifications.push({
          id: `budget-${budget.id}`,
          type: 'budget',
          title: 'Sắp vượt ngân sách',
          message: `Bạn đã chi ${budget.percentage.toFixed(0)}% ngân sách cho ${budget.categoryName}`,
          timestamp: new Date(),
          read: false,
          actionLink: '/budgets',
        });
      } else if (budget.percentage >= 100) {
        newNotifications.push({
          id: `budget-over-${budget.id}`,
          type: 'budget',
          title: 'Đã vượt ngân sách!',
          message: `Bạn đã vượt ${(budget.percentage - 100).toFixed(0)}% ngân sách cho ${budget.categoryName}`,
          timestamp: new Date(),
          read: false,
          actionLink: '/budgets',
        });
      }
    });

    // Goal notifications
    goals.forEach((goal: any) => {
      if (goal.progress >= 75 && goal.progress < 100) {
        newNotifications.push({
          id: `goal-${goal.id}`,
          type: 'goal',
          title: 'Gần đạt mục tiêu!',
          message: `Mục tiêu "${goal.name}" đã đạt ${goal.progress.toFixed(0)}%`,
          timestamp: new Date(),
          read: false,
          actionLink: '/goals',
        });
      } else if (goal.progress >= 100) {
        newNotifications.push({
          id: `goal-complete-${goal.id}`,
          type: 'goal',
          title: 'Chúc mừng! 🎉',
          message: `Bạn đã hoàn thành mục tiêu "${goal.name}"`,
          timestamp: new Date(),
          read: false,
          actionLink: '/goals',
        });
      }

      // Deadline warnings
      if (goal.deadline) {
        const deadline = new Date(goal.deadline);
        const today = new Date();
        const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining <= 7 && daysRemaining > 0 && goal.progress < 100) {
          newNotifications.push({
            id: `goal-deadline-${goal.id}`,
            type: 'info',
            title: 'Sắp hết hạn',
            message: `Mục tiêu "${goal.name}" còn ${daysRemaining} ngày`,
            timestamp: new Date(),
            read: false,
            actionLink: '/goals',
          });
        }
      }
    });

    // Reminder notifications
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    reminders.forEach((reminder: any) => {
      if (!reminder.enabled) return;

      let shouldNotify = false;

      if (reminder.type === 'DAILY') {
        shouldNotify = true;
      } else if (reminder.frequency === 'MONTHLY' && reminder.dayOfMonth) {
        shouldNotify = today.getDate() === reminder.dayOfMonth;
      } else if (reminder.frequency === 'WEEKLY' && reminder.dayOfWeek) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        shouldNotify = dayNames[today.getDay()] === reminder.dayOfWeek;
      }

      if (shouldNotify) {
        newNotifications.push({
          id: `reminder-${reminder.id}`,
          type: 'reminder',
          title: reminder.title,
          message: reminder.type === 'DAILY' 
            ? 'Đừng quên ghi lại thu chi hôm nay' 
            : `Nhắc nhở: ${reminder.title}`,
          timestamp: new Date(),
          read: false,
          actionLink: '/transactions',
        });
      }
    });

    // Sort by timestamp descending
    newNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter(n => !n.read).length);
  }, [budgets, goals, reminders]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'budget': return AlertTriangle;
      case 'goal': return Target;
      case 'reminder': return Calendar;
      default: return Info;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'budget': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950';
      case 'goal': return 'text-green-600 bg-green-50 dark:bg-green-950';
      case 'reminder': return 'text-blue-600 bg-blue-50 dark:bg-blue-950';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Thông báo</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <Check className="w-4 h-4 mr-2" />
            Đánh dấu đã đọc tất cả
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BellOff className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Không có thông báo</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Bạn sẽ nhận được thông báo về ngân sách, mục tiêu và nhắc nhở ở đây
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = getIcon(notification.type);
            const colorClass = getColor(notification.type);

            return (
              <Card 
                key={notification.id} 
                className={`transition-all ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`font-semibold ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {notification.timestamp.toLocaleTimeString('vi-VN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => dismissNotification(notification.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {notification.actionLink && (
                        <Link to={notification.actionLink}>
                          <Button variant="link" size="sm" className="px-0 mt-2">
                            Xem chi tiết →
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Ngân sách
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {budgets.filter((b: any) => b.percentage >= 90).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Cần chú ý</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              Mục tiêu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {goals.filter((g: any) => g.progress >= 75 && g.progress < 100).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Sắp đạt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Nhắc nhở
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {reminders.filter((r: any) => r.enabled).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Đang hoạt động</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}