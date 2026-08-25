import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type AppButtonProps = PropsWithChildren<{
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}>;

export default function AppButton({ children, onPress, variant = 'primary', disabled = false }: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={{ color: variant === 'primary' ? colors.primaryDark : colors.border }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        pressed && !disabled && variant === 'primary' && styles.primaryPressed,
        pressed && !disabled && variant !== 'primary' && styles.secondaryPressed,
      ]}
    >
      <Text style={[styles.label, variant !== 'primary' && styles.secondaryLabel]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.surface,
    borderColor: colors.danger,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  primaryPressed: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  secondaryPressed: {
    backgroundColor: '#EFE8DC',
    borderColor: colors.accent,
  },
  label: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryLabel: {
    color: colors.text,
  },
});
