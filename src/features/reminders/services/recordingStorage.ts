import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { createId } from '../../../shared/utils/id';

const STORAGE_KEY = '@azkar/recordings';
const RECORDINGS_DIRECTORY = `${FileSystem.documentDirectory ?? ''}recordings/`;

export type SavedRecording = {
  id: string;
  name: string;
  uri: string;
  createdAt: string;
};

export async function getSavedRecordings(): Promise<SavedRecording[]> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  if (!value) {
    return [];
  }

  try {
    const recordings = JSON.parse(value) as SavedRecording[];
    return Array.isArray(recordings) ? recordings : [];
  } catch {
    return [];
  }
}

export async function saveRecording(sourceUri: string, name = 'Recorded voice') {
  if (!FileSystem.documentDirectory) {
    throw new Error('Document directory is not available.');
  }

  await ensureRecordingsDirectory();

  const now = new Date();
  const id = createId('recording');
  const fileName = `${id}.m4a`;
  const uri = `${RECORDINGS_DIRECTORY}${fileName}`;

  await FileSystem.copyAsync({
    from: sourceUri,
    to: uri,
  });

  const recording: SavedRecording = {
    id,
    name: `${name} ${formatRecordingDate(now)}`,
    uri,
    createdAt: now.toISOString(),
  };
  const recordings = await getSavedRecordings();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([recording, ...recordings]));

  return recording;
}

async function ensureRecordingsDirectory() {
  const info = await FileSystem.getInfoAsync(RECORDINGS_DIRECTORY);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(RECORDINGS_DIRECTORY, { intermediates: true });
  }
}

function formatRecordingDate(date: Date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  return `${day}/${month} ${hours}:${minutes}`;
}
