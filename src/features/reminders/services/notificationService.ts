import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { Reminder } from '../models/Reminder';
import { playAudioUri } from './audioService';
import { getUpcomingReminderDates } from '../utils/reminderTime';

const MAX_NOTIFICATIONS_PER_REMINDER = 48;
const DEFAULT_CHANNEL_ID = 'azkar-reminders-custom-sound-v1';
const NOTIFICATION_SOUND = 'azkar_reminder.ogg';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission() {
  try {
    await configureNotificationChannel();
  } catch (error) {
    console.warn('Unable to configure notification channel.', error);
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function configureNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
    name: 'Azkar reminders',
    importance: Notifications.AndroidImportance.MAX,
    sound: getNotificationChannelSound(),
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function scheduleReminderNotifications(reminder: Reminder) {
  if (!reminder.isEnabled) {
    return [];
  }

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    return [];
  }

  const notificationIds: string[] = [];
  const dates = getUpcomingReminderDates(reminder, MAX_NOTIFICATIONS_PER_REMINDER);

  for (const date of dates) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: 'Time for your dhikr reminder',
          data: {
            audioUri: reminder.audioUri ?? '',
          },
          sound: getNotificationContentSound(),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          channelId: DEFAULT_CHANNEL_ID,
          date,
        },
      });
      notificationIds.push(id);
    } catch (error) {
      if (!isAlarmLimitError(error)) {
        console.warn('Unable to schedule all reminder notifications.', error);
      }
      break;
    }
  }

  return notificationIds;
}

export async function cancelReminderNotifications(notificationIds: string[]) {
  await Promise.allSettled(notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

export async function repairReminderNotificationLimit(reminders: Reminder[]) {
  const trackedNotificationIds = reminders.flatMap((reminder) => reminder.notificationIds);
  if (trackedNotificationIds.length === 0) {
    return reminders;
  }

  await cancelReminderNotifications(trackedNotificationIds);
  const repairedReminders: Reminder[] = [];

  for (const reminder of reminders) {
    const notificationIds = await scheduleReminderNotifications({
      ...reminder,
      notificationIds: [],
    });
    repairedReminders.push({ ...reminder, notificationIds });
  }

  return repairedReminders;
}

export async function sendTestNotification() {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    return false;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Azkar reminder test',
      body: 'This reminder was scheduled 5 seconds ago.',
      sound: getNotificationContentSound(),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      channelId: DEFAULT_CHANNEL_ID,
      seconds: 5,
    },
  });

  return true;
}

export async function getScheduledNotificationCount() {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  return notifications.length;
}

export async function getNotificationDiagnostics() {
  const permissions = await Notifications.getPermissionsAsync();
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

  return {
    granted: permissions.granted,
    status: permissions.status,
    scheduledCount: scheduledNotifications.length,
  };
}

export function listenForReminderAudioPlayback() {
  return Notifications.addNotificationReceivedListener((notification) => {
    const audioUri = notification.request.content.data?.audioUri;
    if (typeof audioUri === 'string' && audioUri.length > 0) {
      try {
        playAudioUri(audioUri);
      } catch (error) {
        console.warn('Unable to play reminder audio.', error);
      }
    }
  });
}

function isAlarmLimitError(error: unknown) {
  return error instanceof Error && error.message.toLowerCase().includes('maximum limit of concurrent alarms');
}

function getNotificationChannelSound() {
  return isExpoGo() ? undefined : NOTIFICATION_SOUND;
}

function getNotificationContentSound() {
  return isExpoGo() ? true : NOTIFICATION_SOUND;
}

function isExpoGo() {
  return Constants.executionEnvironment === 'storeClient' && Constants.expoVersion !== null;
}
