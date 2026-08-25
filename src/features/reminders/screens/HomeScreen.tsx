import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import AppButton from '../../../shared/components/AppButton';
import AppCard from '../../../shared/components/AppCard';
import AppScreen from '../../../shared/components/AppScreen';
import { colors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { typography } from '../../../shared/theme/typography';
import type { RootStackParamList } from '../../../navigation/navigationTypes';
import ReminderCard from '../components/ReminderCard';
import { useReminders } from '../hooks/useReminders';
import { formatCountdown, getNextReminder } from '../utils/reminderTime';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const {
    reminders,
    isLoading,
    deleteReminder,
    toggleReminder,
    refreshReminders,
    sendTestNotification,
    getNotificationDiagnostics,
  } = useReminders();
  const [now, setNow] = useState(() => new Date());
  const [scheduledCount, setScheduledCount] = useState<number | undefined>();
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const nextReminder = useMemo(() => getNextReminder(reminders, now), [now, reminders]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshReminders();
      void refreshScheduledCount();
    }, [refreshReminders]),
  );

  async function refreshScheduledCount() {
    try {
      const diagnostics = await getNotificationDiagnostics();
      setScheduledCount(diagnostics.scheduledCount);
      setPermissionStatus(diagnostics.granted ? 'granted' : diagnostics.status);
    } catch (error) {
      console.warn('Unable to read scheduled notification count.', error);
    }
  }

  async function handleTestNotification() {
    try {
      const didSend = await sendTestNotification();
      if (!didSend) {
        Alert.alert('Notifications disabled', 'Please allow notifications for AzkarAppNew from system settings.');
      }
      await refreshScheduledCount();
    } catch (error) {
      console.warn('Unable to send test notification.', error);
      Alert.alert('Notification test failed', 'Please clear the app storage or reinstall the app, then try again.');
    }
  }

  return (
    <AppScreen>
      <AppButton onPress={() => navigation.navigate('AddReminder')}>Add Reminder</AppButton>
      <AppButton onPress={handleTestNotification} variant="secondary">
        Test Notification
      </AppButton>
      <AppCard>
        <View style={styles.countdownHeader}>
          <Text style={styles.countdownLabel}>Next reminder</Text>
          <Text style={styles.countdownTime}>
            {nextReminder ? formatCountdown(nextReminder.millisecondsUntil) : '--:--:--'}
          </Text>
        </View>
        <Text style={styles.countdownTitle}>
          {nextReminder ? `${nextReminder.reminder.title} at ${formatTime(nextReminder.date)}` : 'No enabled reminders'}
        </Text>
        <Text style={styles.scheduledCount}>
          Notifications: {permissionStatus} | Scheduled: {scheduledCount === undefined ? 'unknown' : scheduledCount}
        </Text>
        <Text style={styles.scheduledCount}>
          Selected files and saved recordings can play while the app is open. Closed app notifications use the system sound.
        </Text>
      </AppCard>
      {isLoading ? <Text style={styles.emptyText}>Loading reminders...</Text> : null}
      {!isLoading && reminders.length === 0 ? (
        <Text style={styles.emptyText}>No reminders yet. Add your first azkar reminder.</Text>
      ) : null}
      {reminders.map((reminder) => (
        <ReminderCard
          key={reminder.id}
          onDelete={deleteReminder}
          onEdit={(selectedReminder) => navigation.navigate('EditReminder', { reminder: selectedReminder })}
          onToggle={toggleReminder}
          reminder={reminder}
        />
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  countdownHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  countdownLabel: {
    color: colors.muted,
    fontWeight: '700',
  },
  countdownTime: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '900',
  },
  countdownTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  scheduledCount: {
    color: colors.muted,
    fontSize: typography.caption,
  },
  emptyText: {
    color: colors.muted,
    fontSize: typography.body,
    textAlign: 'center',
  },
});

function formatTime(date: Date) {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}
