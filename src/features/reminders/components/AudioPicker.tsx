import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import AppButton from '../../../shared/components/AppButton';
import { colors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { pickAudioFile, playAudioUri } from '../services/audioService';
import { getSavedRecordings, saveRecording, type SavedRecording } from '../services/recordingStorage';

type AudioPickerProps = {
  audioName?: string;
  audioUri?: string;
  onChange: (audio?: { name?: string; uri?: string }) => void;
};

export default function AudioPicker({ audioName, audioUri, onChange }: AudioPickerProps) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [recordings, setRecordings] = useState<SavedRecording[]>([]);
  const [isRecordingsOpen, setIsRecordingsOpen] = useState(false);

  useEffect(() => {
    void loadRecordings();
  }, []);

  async function loadRecordings() {
    try {
      setRecordings(await getSavedRecordings());
    } catch (error) {
      console.warn('Unable to load saved recordings.', error);
    }
  }

  async function handlePickAudio() {
    try {
      const audio = await pickAudioFile();
      if (audio) {
        onChange({ name: audio.name, uri: audio.uri });
      }
    } catch (error) {
      console.warn('Unable to pick audio file.', error);
      Alert.alert('Audio not selected', 'Please choose another audio file.');
    }
  }

  async function handleStartRecording() {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Microphone disabled', 'Please allow microphone access from system settings.');
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (error) {
      console.warn('Unable to start recording.', error);
      Alert.alert('Recording failed', 'Please try recording again.');
    }
  }

  async function handleStopRecording() {
    try {
      await recorder.stop();
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      const recordedUri = recorder.uri ?? recorder.getStatus().url;
      if (recordedUri) {
        const savedRecording = await saveRecording(recordedUri);
        onChange({ name: savedRecording.name, uri: savedRecording.uri });
        setRecordings((current) => [savedRecording, ...current]);
        Alert.alert('Recording saved', 'You can reuse this recording from Saved Recordings.');
        return;
      }

      Alert.alert('Recording not saved', 'No recording file was returned. Please try again.');
    } catch (error) {
      console.warn('Unable to stop recording.', error);
      Alert.alert('Recording failed', 'Please try recording again.');
    }
  }

  function handleUseDefaultAudio() {
    onChange(undefined);
  }

  function handleSelectRecording(recording: SavedRecording) {
    onChange({ name: recording.name, uri: recording.uri });
    setIsRecordingsOpen(false);
  }

  function handlePreviewAudio() {
    if (!audioUri) {
      return;
    }

    try {
      playAudioUri(audioUri);
    } catch (error) {
      console.warn('Unable to preview audio.', error);
      Alert.alert('Preview failed', 'This audio file could not be played.');
    }
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Audio</Text>
      <Text style={styles.value}>{audioUri ? audioName ?? 'Audio selected' : 'System notification sound'}</Text>
      <Text style={styles.note}>
        Saved recordings can be reused for new reminders. Closed app notifications still use the system sound.
      </Text>
      <AppButton onPress={handlePickAudio} variant="secondary">
        Choose Audio File
      </AppButton>
      {recorderState.isRecording ? (
        <AppButton onPress={handleStopRecording} variant="danger">
          Stop Recording
        </AppButton>
      ) : (
        <AppButton onPress={handleStartRecording} variant="secondary">
          Record My Voice
        </AppButton>
      )}
      <AppButton
        disabled={recordings.length === 0}
        onPress={() => setIsRecordingsOpen((current) => !current)}
        variant="secondary"
      >
        {recordings.length === 0 ? 'No Saved Recordings' : 'Use Saved Recording'}
      </AppButton>
      {isRecordingsOpen ? (
        <View style={styles.dropdown}>
          {recordings.map((recording) => (
            <Pressable key={recording.id} onPress={() => handleSelectRecording(recording)} style={styles.option}>
              <Text style={styles.optionTitle}>{recording.name}</Text>
              <Text style={styles.optionMeta}>Saved recording</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {audioUri ? (
        <AppButton onPress={handlePreviewAudio} variant="secondary">
          Preview Audio
        </AppButton>
      ) : null}
      <AppButton onPress={handleUseDefaultAudio} variant="secondary">
        Use System Sound
      </AppButton>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    color: colors.muted,
    fontWeight: '700',
  },
  value: {
    color: colors.text,
  },
  note: {
    color: colors.muted,
    fontSize: 13,
  },
  dropdown: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  option: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  optionMeta: {
    color: colors.muted,
    fontSize: 12,
  },
});
