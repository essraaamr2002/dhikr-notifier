import type { Reminder } from '../features/reminders/models/Reminder';

export type RootStackParamList = {
  Home: undefined;
  AddReminder: undefined;
  EditReminder: {
    reminder: Reminder;
  };
};
