import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { listenForReminderAudioPlayback } from './src/features/reminders/services/notificationService';

export default function App() {
  useEffect(() => {
    const subscription = listenForReminderAudioPlayback();
    return () => subscription.remove();
  }, []);

  return (
    <>
      <AppNavigator />
      <StatusBar style="dark" />
    </>
  );
}
