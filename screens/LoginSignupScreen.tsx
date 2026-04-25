import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StatusBar } from 'react-native';

const BACKEND_URL = 'http://10.124.63.36:8080/chatapp';

export default function LoginSignupScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    if (!mobileNumber || !password || (!isLogin && !name)) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    try {
      const endpoint = isLogin ? '/login' : '/signup';
      const body = isLogin
        ? { mobile_number: mobileNumber, password }
        : { name, mobile_number: mobileNumber, password };

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        Alert.alert('Server Error', 'The server returned an unexpected response.');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        navigation.replace('ChatList', {
          userId: data.id,
          username: data.name,
          mobileNumber: data.mobile_number,
        });
      } else {
        Alert.alert('Error', data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Request failed:', error);
      Alert.alert('Connection Error', 'Could not connect to server.');
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#0a0a1a]"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />

      {/* Header / Hero */}
      <View className="items-center pt-20 pb-10 px-6">
        <View className="w-20 h-20 rounded-3xl bg-[#6C63FF] items-center justify-center mb-6 shadow-lg">
          <Text className="text-4xl">💬</Text>
        </View>
        <Text className="text-4xl font-bold text-white tracking-tight">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Text>
        <Text className="text-[#9ca3af] mt-2 text-base text-center">
          {isLogin ? 'Sign in to continue chatting' : 'Join and start connecting'}
        </Text>
      </View>

      {/* Card */}
      <View className="mx-5 bg-[#13132b] rounded-3xl p-6 shadow-2xl border border-[#2a2a4a]">
        {/* Toggle */}
        <View className="flex-row bg-[#1e1e3a] rounded-2xl p-1 mb-6">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl items-center ${isLogin ? 'bg-[#6C63FF]' : ''}`}
            onPress={() => setIsLogin(true)}
          >
            <Text className={`font-semibold text-sm ${isLogin ? 'text-white' : 'text-[#9ca3af]'}`}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl items-center ${!isLogin ? 'bg-[#6C63FF]' : ''}`}
            onPress={() => setIsLogin(false)}
          >
            <Text className={`font-semibold text-sm ${!isLogin ? 'text-white' : 'text-[#9ca3af]'}`}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        {!isLogin && (
          <View className="mb-4">
            <Text className="text-[#9ca3af] text-sm mb-2 ml-1">Full Name</Text>
            <View className="bg-[#1e1e3a] rounded-2xl flex-row items-center px-4 border border-[#2a2a4a]">
              <Text className="text-[#6C63FF] text-lg mr-2">👤</Text>
              <TextInput
                className="flex-1 text-white py-4 text-base"
                placeholder="Your full name"
                placeholderTextColor="#4a4a6a"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>
        )}

        <View className="mb-4">
          <Text className="text-[#9ca3af] text-sm mb-2 ml-1">Mobile Number</Text>
          <View className="bg-[#1e1e3a] rounded-2xl flex-row items-center px-4 border border-[#2a2a4a]">
            <Text className="text-[#6C63FF] text-lg mr-2">📱</Text>
            <TextInput
              className="flex-1 text-white py-4 text-base"
              placeholder="07X XXXX XXX"
              placeholderTextColor="#4a4a6a"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-[#9ca3af] text-sm mb-2 ml-1">Password</Text>
          <View className="bg-[#1e1e3a] rounded-2xl flex-row items-center px-4 border border-[#2a2a4a]">
            <Text className="text-[#6C63FF] text-lg mr-2">🔒</Text>
            <TextInput
              className="flex-1 text-white py-4 text-base"
              placeholder="Enter password"
              placeholderTextColor="#4a4a6a"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="bg-[#6C63FF] rounded-2xl py-4 items-center shadow-lg"
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Text className="text-white text-base font-bold tracking-wide">
            {isLogin ? 'Sign In →' : 'Create Account →'}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="py-8 items-center">
        <Text className="text-[#4a4a6a] text-sm">Secure • Private • Fast</Text>
      </View>
    </ScrollView>
  );
}
