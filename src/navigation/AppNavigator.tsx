import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useAppSelector, useTheme} from '../app/hooks';
import {AppIcon} from '../components/Icon';
import {HomeScreen} from '../screens/HomeScreen';
import {BookingsScreen} from '../screens/BookingsScreen';
import {PrescriptionsScreen} from '../screens/PrescriptionsScreen';
import {ProfileScreen} from '../screens/ProfileScreen';
import {BookingScreen} from '../screens/BookingScreen';
import {BookingStatusScreen} from '../screens/BookingStatusScreen';
import {PrescriptionDetailScreen} from '../screens/PrescriptionDetailScreen';
import {RemindersScreen} from '../screens/RemindersScreen';
import {AdminScreen} from '../screens/AdminScreen';
import {useLocalizedText} from '../localization/i18n';
import type {RootRoutes, TabRoutes} from './types';

const Stack = createNativeStackNavigator<RootRoutes>();
const Tab = createBottomTabNavigator<TabRoutes>();
const tabScreens = {home: HomeScreen, bookings: BookingsScreen, prescriptions: PrescriptionsScreen, profile: ProfileScreen};
function MainTabs() {
  const theme = useTheme(); const localize = useLocalizedText();
  const tabs = useAppSelector(state => state.layout.current.tabs);
  return <Tab.Navigator screenOptions={{
    headerShown: false,
    tabBarHideOnKeyboard: true,
    tabBarStyle: {backgroundColor: theme.surface, borderTopColor: theme.border, borderTopWidth: 1, height: 69, paddingTop: 7, paddingBottom: 7},
    tabBarActiveTintColor: theme.primary, tabBarInactiveTintColor: theme.textSecondary,
    tabBarLabelStyle: {fontSize: theme.font.caption, fontWeight: '600'},
  }}>
    {tabs.map(tab => <Tab.Screen key={tab.id} name={tab.screen} component={tabScreens[tab.screen]} options={{
      tabBarLabel: localize(tab.label),
      tabBarIcon: ({color, size}) => <AppIcon name={tab.icon} color={color} size={size} />,
    }} />)}
  </Tab.Navigator>;
}
export function AppNavigator() {
  const theme = useTheme();
  return <NavigationContainer theme={{...DefaultTheme, colors: {...DefaultTheme.colors, background: theme.background, card: theme.surface, text: theme.textPrimary, primary: theme.primary, border: theme.border}}}>
    <StatusBar barStyle="dark-content" />
    <Stack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="BookingStatus" component={BookingStatusScreen} options={{gestureEnabled: false}} />
      <Stack.Screen name="PrescriptionDetail" component={PrescriptionDetailScreen} />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />
    </Stack.Navigator>
  </NavigationContainer>;
}
