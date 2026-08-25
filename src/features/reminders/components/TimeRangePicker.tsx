import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';

type TimeRangePickerProps = {
  startTime: string;
  endTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
};

export default function TimeRangePicker({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}: TimeRangePickerProps) {
  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <Text style={styles.label}>Start</Text>
        <TextInput value={startTime} onChangeText={onStartTimeChange} placeholder="08:00" style={styles.input} />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>End</Text>
        <TextInput value={endTime} onChangeText={onEndTimeChange} placeholder="22:00" style={styles.input} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  field: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    color: colors.muted,
    fontWeight: '700',
  },
  input: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
});
