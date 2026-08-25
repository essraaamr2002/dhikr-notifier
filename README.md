# Dhikr Notifier

Mobile reminder app for daily dhikr built with Expo and React Native.

## Features

- Create dhikr reminders with a start time, end time, and repeat interval.
- Schedule local notifications for upcoming reminders.
- Record personal audio while using the app.
- Reuse saved recordings from a recordings list.
- Pick an audio file from the device.
- Use a bundled custom notification sound for Android builds.
- Preview selected audio inside the app.

## Tech Stack

- Expo SDK 57
- React Native
- TypeScript
- Expo Notifications
- Expo Audio
- AsyncStorage

## Run Locally

Install dependencies:

```powershell
npm install
```

Start Expo:

```powershell
npm start
```

Or run with a clean cache:

```powershell
npx expo start -c
```

## Android Build

Custom notification sounds do not work from Expo Go. Build and install an APK/dev build to test notification audio while the app is closed.

```powershell
npx eas build -p android --profile preview
```

## Custom Notification Sound

The bundled Android notification sound is:

```text
assets/sounds/azkar_reminder.ogg
```

The sound is registered in `app.json` through the `expo-notifications` config plugin and used by the Android notification channel in:

```text
src/features/reminders/services/notificationService.ts
```

Important: Android notification channels keep their sound settings after creation. If the sound changes, uninstall the app or use a new channel id before testing again.

## Notes

Recorded audio can play while the app is open. Android system notifications shown while the app is closed can only use sounds bundled into the native app build.
