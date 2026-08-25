import type { Reminder } from '../models/Reminder';

export function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function timeToMinutes(time: string) {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

export function getReminderTimes(startTime: string, endTime: string, intervalMinutes: number) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const normalizedEnd = end >= start ? end : end + 24 * 60;
  const times: string[] = [];

  for (let minute = start; minute <= normalizedEnd; minute += intervalMinutes) {
    times.push(minutesToTime(minute % (24 * 60)));
  }

  return times;
}

export function getNextReminder(reminders: Reminder[], now = new Date()) {
  let nextReminder: Reminder | undefined;
  let nextDate: Date | undefined;

  for (const reminder of reminders) {
    if (!reminder.isEnabled) {
      continue;
    }

    const times = getReminderTimes(reminder.startTime, reminder.endTime, reminder.intervalMinutes);
    for (const time of times) {
      const [hour, minute] = time.split(':').map(Number);
      const candidate = new Date(now);
      candidate.setHours(hour, minute, 0, 0);

      if (candidate.getTime() <= now.getTime()) {
        candidate.setDate(candidate.getDate() + 1);
      }

      if (!nextDate || candidate.getTime() < nextDate.getTime()) {
        nextDate = candidate;
        nextReminder = reminder;
      }
    }
  }

  if (!nextReminder || !nextDate) {
    return undefined;
  }

  return {
    reminder: nextReminder,
    date: nextDate,
    millisecondsUntil: nextDate.getTime() - now.getTime(),
  };
}

export function getUpcomingReminderDates(
  reminder: Pick<Reminder, 'endTime' | 'intervalMinutes' | 'startTime'>,
  maxOccurrences: number,
  now = new Date(),
) {
  const times = getReminderTimes(reminder.startTime, reminder.endTime, reminder.intervalMinutes);
  const dates: Date[] = [];

  for (let dayOffset = 0; dates.length < maxOccurrences && dayOffset < 30; dayOffset += 1) {
    for (const time of times) {
      const [hour, minute] = time.split(':').map(Number);
      const candidate = new Date(now);
      candidate.setDate(candidate.getDate() + dayOffset);
      candidate.setHours(hour, minute, 0, 0);

      if (candidate.getTime() > now.getTime()) {
        dates.push(candidate);
      }

      if (dates.length >= maxOccurrences) {
        break;
      }
    }
  }

  return dates;
}

export function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}
