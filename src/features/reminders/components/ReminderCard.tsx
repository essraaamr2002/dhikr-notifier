import { StyleSheet, Text, View } from 'react-native';
import AppButton from '../../../shared/components/AppButton';
import AppCard from '../../../shared/components/AppCard';
import { colors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import type { Reminder } from '../models/Reminder';

type ReminderCardProps = {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
};

export default function ReminderCard({ reminder, onEdit, onDelete, onToggle }: ReminderCardProps) {
  return (
    <AppCard>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{reminder.title}</Text>
          <Text style={styles.status}>{reminder.isEnabled ? 'Enabled' : 'Disabled'}</Text>
        </View>
        <Text style={styles.interval}>Every {reminder.intervalMinutes} min</Text>
      </View>
      <Text style={styles.meta}>
        {reminder.startTime} - {reminder.endTime}
      </Text>
      {reminder.audioUri ? <Text style={styles.meta}>Audio: {reminder.audioName ?? 'Selected audio'}</Text> : null}
      <View style={styles.actions}>
        <AppButton onPress={() => onToggle(reminder.id)} variant="secondary">
          {reminder.isEnabled ? 'Disable' : 'Enable'}
        </AppButton>
        <AppButton onPress={() => onEdit(reminder)} variant="secondary">
          Edit
        </AppButton>
        <AppButton onPress={() => onDelete(reminder.id)} variant="danger">
          Delete
        </AppButton>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  titleGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  status: {
    color: colors.primary,
    fontWeight: '700',
  },
  interval: {
    color: colors.muted,
    fontWeight: '700',
  },
  meta: {
    color: colors.muted,
  },
  actions: {
    gap: spacing.sm,
  },
});
