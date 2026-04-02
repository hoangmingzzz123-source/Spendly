import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { remindersApi, budgetsApi, goalsApi } from '../../lib/api';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';

// Tạo key duy nhất cho mỗi thông báo để tránh lặp lại toast
function getNotificationKey(reminder: any) {
  return `${reminder.id}-${reminder.type}-${reminder.frequency}-${reminder.dayOfMonth || ''}-${reminder.dayOfWeek || ''}-${reminder.time}`;
}

export function useGlobalRemindersNotification() {
  const { accessToken } = useStore();
  const shownNotifications = useRef<Set<string>>(new Set());

  // Lấy danh sách nhắc nhở
  const { data: remindersData } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => remindersApi.getAll(),
    enabled: !!accessToken,
    refetchInterval: 60 * 1000, // Kiểm tra mỗi phút
  });

  const reminders = remindersData?.data || [];

  useEffect(() => {
    if (!reminders.length) return;
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    reminders.forEach((reminder: any) => {
      if (!reminder.enabled) return;
      let shouldNotify = false;
      if (reminder.type === 'DAILY') {
        shouldNotify = true;
      } else if (reminder.frequency === 'MONTHLY' && reminder.dayOfMonth) {
        shouldNotify = today.getDate() === reminder.dayOfMonth;
      } else if (reminder.frequency === 'WEEKLY' && reminder.dayOfWeek) {
        shouldNotify = dayNames[today.getDay()] === reminder.dayOfWeek;
      }
      if (shouldNotify) {
        const key = getNotificationKey(reminder);
        if (!shownNotifications.current.has(key)) {
          toast.info(reminder.title || 'Bạn có nhắc nhở mới!', {
            description: reminder.type === 'DAILY' ? 'Đừng quên ghi lại thu chi hôm nay' : `Nhắc nhở: ${reminder.title}`,
            duration: 10000,
          });
          shownNotifications.current.add(key);
        }
      }
    });
  }, [reminders]);
}
