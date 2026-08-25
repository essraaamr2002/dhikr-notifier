import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Reminder } from '../models/Reminder';

const STORAGE_KEY = '@azkar/reminders';

export async function getStoredReminders() {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  return value ? (JSON.parse(value) as Reminder[]) : [];
}

export async function saveStoredReminders(reminders: Reminder[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}
