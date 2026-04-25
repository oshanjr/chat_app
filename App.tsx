import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginSignupScreen from './screens/LoginSignupScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatWindowScreen from './screens/ChatWindowScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();

const AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#6C63FF',
    background: '#0a0a1a',
    card: '#0d0d20',
    text: '#EAEAEA',
    border: '#1e1e3a',
    notification: '#6C63FF',
  },
};

export default function App() {
  return (
    <NavigationContainer theme={AppTheme}>
      <Stack.Navigator
        initialRouteName="LoginSignup"
        screenOptions={{
          headerStyle: { backgroundColor: '#0d0d20' },
          headerTintColor: '#EAEAEA',
          headerTitleStyle: { fontWeight: 'bold' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#0a0a1a' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="LoginSignup" component={LoginSignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Messages', headerShown: false }} />
        <Stack.Screen name="ChatWindow" component={ChatWindowScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
