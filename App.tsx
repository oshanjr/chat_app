import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginSignupScreen from './screens/LoginSignupScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatWindowScreen from './screens/ChatWindowScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="LoginSignup"
        screenOptions={{
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="LoginSignup" component={LoginSignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Messages' }} />
        <Stack.Screen name="ChatWindow" component={ChatWindowScreen} options={({ route }) => ({ title: route.params.chatName || 'Chat' })} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
