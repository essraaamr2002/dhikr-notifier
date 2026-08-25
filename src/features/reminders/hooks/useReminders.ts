import { useCallback, useEffect, useState } from 'react';
import { createId } from '../../../shared/utils/id';
import type { Reminder, ReminderInput } from '../models/Reminder';
import {
  cancelReminderNotifications,
  repairReminderNotificationLimit,
  scheduleReminderNotifications,
  sendTestNotification,
  getScheduledNotificationCount,
  getNotificationDiagnostics,
} from '../services/notificationService';
import { getStoredReminders, saveStoredReminders } from '../services/reminderStorage';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const persistReminders = useCallback(async (nextReminders: Reminder[]) => {
    setReminders(nextReminders);
    await saveStoredReminders(nextReminders);
  }, []);

  const loadReminders = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedReminders = await getStoredReminders();
      const repairedReminders = await repairReminderNotificationLimit(storedReminders);
      if (repairedReminders !== storedReminders) {
        await saveStoredReminders(repairedReminders);
      }
      setReminders(repairedReminders);
    } catch (error) {
      console.warn('Unable to load reminders.', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addReminder = useCallback(
    async (input: ReminderInput) => {
      const storedReminders = await getStoredReminders();
      const now = new Date().toISOString();
      const reminder: Reminder = {
        ...input,
        id: createId('reminder'),
        notificationIds: [],
        createdAt: now,
        updatedAt: now,
      };
      const notificationIds = await scheduleReminderNotifications(reminder);
      const nextReminder = { ...reminder, notificationIds };
      await persistReminders([nextReminder, ...storedReminders]);
      return nextReminder;
    },
    [persistReminders],
  );

  const updateReminder = useCallback(
    async (id: string, input: ReminderInput) => {
      const storedReminders = await getStoredReminders();
      const current = storedReminders.find((reminder) => reminder.id === id);
      if (!current) {
        return;
      }

      await cancelReminderNotifications(current.notificationIds);
      const updated: Reminder = {
        ...current,
        ...input,
        notificationIds: [],
        updatedAt: new Date().toISOString(),
      };
      const notificationIds = await scheduleReminderNotifications(updated);
      const nextReminder = { ...updated, notificationIds };
      await persistReminders(
        storedReminders.map((reminder) => (reminder.id === id ? nextReminder : reminder)),
      );
      return nextReminder;
    },
    [persistReminders],
  );

  const deleteReminder = useCallback(
    async (id: string) => {
      const storedReminders = await getStoredReminders();
      const current = storedReminders.find((reminder) => reminder.id === id);
      if (current) {
        await cancelReminderNotifications(current.notificationIds);
      }
      await persistReminders(storedReminders.filter((reminder) => reminder.id !== id));
    },
    [persistReminders],
  );

  const toggleReminder = useCallback(
    async (id: string) => {
      const current = reminders.find((reminder) => reminder.id === id);
      if (!current) {
        return;
      }

      await updateReminder(id, {
        title: current.title,
        startTime: current.startTime,
        endTime: current.endTime,
        intervalMinutes: current.intervalMinutes,
        audioUri: current.audioUri,
        audioName: current.audioName,
        isEnabled: !current.isEnabled,
      });
    },
    [reminders, updateReminder],
  );

  useEffect(() => {
    void loadReminders();
  }, [loadReminders]);

  return {
    reminders,
    isLoading,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    sendTestNotification,
    getScheduledNotificationCount,
    getNotificationDiagnostics,
    refreshReminders: loadReminders,
  };
}
