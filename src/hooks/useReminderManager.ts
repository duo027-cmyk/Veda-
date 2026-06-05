// 提醒管理 hook
import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';

export function useReminderManager() {
  const { userData, updateUserDataPartial } = useAppStore();
  const userDataRef = useRef(userData);

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  useEffect(() => {
    const checkReminders = () => {
      const currentData = userDataRef.current;
      if (!currentData?.reminders) return;
      
      const now = Date.now();
      const dueReminders = currentData.reminders.filter(r => 
        !r.completed && 
        new Date(r.time).getTime() <= now && 
        new Date(r.time).getTime() > now - 60000
      );

      if (dueReminders.length > 0) {
        window.dispatchEvent(new CustomEvent('veda_reminder', { 
          detail: { tasks: dueReminders.map(r => r.task) } 
        }));
        
        const updated = currentData.reminders.map(r => 
          dueReminders.some(dr => dr.id === r.id) ? { ...r, completed: true } : r
        );
        updateUserDataPartial({ reminders: updated });
      }
    };

    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [updateUserDataPartial]);
}
