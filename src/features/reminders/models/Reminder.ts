export type Reminder = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  intervalMinutes: number;
  audioUri?: string;
  audioName?: string;
  notificationIds: string[];
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReminderInput = {
  title: string;
  startTime: string;
  endTime: string;
  intervalMinutes: number;
  audioUri?: string;
  audioName?: string;
  isEnabled: boolean;
};
