import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../../../shared/components/AppButton';
import AppCard from '../../../shared/components/AppCard';
import AppScreen from '../../../shared/components/AppScreen';
import { colors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import type { RootStackParamList } from '../../../navigation/navigationTypes';
import AudioPicker from '../components/AudioPicker';
import IntervalPicker from '../components/IntervalPicker';
import TimeRangePicker from '../components/TimeRangePicker';
import { useReminders } from '../hooks/useReminders';

type AddReminderScreenProps = NativeStackScreenProps<RootStackParamList, 'AddReminder'>;

export default function AddReminderScreen({ navigation }: AddReminderScreenProps) {
  const { addReminder } = useReminders();
  const [title, setTitle] = useState('Morning Azkar');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('22:00');
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [audioUri, setAudioUri] = useState<string | undefined>();
  const [audioName, setAudioName] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  function handleAudioChange(audio?: { name?: string; uri?: string }) {
    setAudioName(audio?.name);
    setAudioUri(audio?.uri);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const reminder = await addReminder({
        title,
        startTime,
        endTime,
        intervalMinutes,
        audioUri,
        audioName,
        isEnabled: true,
      });
      if (reminder.notificationIds.length === 0) {
        Alert.alert(
          'Reminder saved without notifications',
          'Please check notification permission, clear old app alarms, or try Test Notification from Home.',
        );
      }
      navigation.goBack();
    } catch (error) {
      console.warn('Unable to save reminder.', error);
      Alert.alert('Reminder not saved', 'Please try again after clearing old scheduled notifications.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppScreen>
      <AppCard>
        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Reminder title" style={styles.input} />
        </View>
        <TimeRangePicker
          endTime={endTime}
          onEndTimeChange={setEndTime}
          onStartTimeChange={setStartTime}
          startTime={startTime}
        />
        <IntervalPicker value={intervalMinutes} onChange={setIntervalMinutes} />
        <AudioPicker audioName={audioName} audioUri={audioUri} onChange={handleAudioChange} />
      </AppCard>
      <AppButton disabled={isSaving || !title.trim() || intervalMinutes <= 0} onPress={handleSave}>
        {isSaving ? 'Saving...' : 'Save Reminder'}
      </AppButton>
    </AppScreen>
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
