import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';

type IntervalPickerProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function IntervalPicker({ value, onChange }: IntervalPickerProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Interval minutes</Text>
      <TextInput
        keyboardType="number-pad"
        onChangeText={(text) => onChange(Number(text) || 0)}
        placeholder="60"
        style={styles.input}
        value={String(value)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
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
