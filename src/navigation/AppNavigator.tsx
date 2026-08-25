import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddReminderScreen from '../features/reminders/screens/AddReminderScreen';
import EditReminderScreen from '../features/reminders/screens/EditReminderScreen';
import HomeScreen from '../features/reminders/screens/HomeScreen';
import { colors } from '../shared/theme/colors';
import type { RootStackParamList } from './navigationTypes';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Azkar Reminders' }} />
        <Stack.Screen name="AddReminder" component={AddReminderScreen} options={{ title: 'Add Reminder' }} />
        <Stack.Screen name="EditReminder" component={EditReminderScreen} options={{ title: 'Edit Reminder' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
