import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StatusBar } from 'react-native';

const BACKEND_URL = 'http://10.124.63.36:8080/chatapp';

export default function ProfileScreen({ route, navigation }) {
  const { userId, username: initialUsername, mobileNumber } = route.params || {};
  const [name, setName] = useState(initialUsername || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: 'My Profile',
      headerStyle: { backgroundColor: '#0a0a1a' },
      headerTintColor: '#EAEAEA',
      headerTitleStyle: { fontWeight: 'bold' },
    });
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/profile?id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setName(data.name || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name cannot be empty.');
      return;
    }
    if (password && password !== confirmPassword) {
      Alert.alert('Validation', 'Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      const body = { name };
      if (password) body['password'] = password;

      const response = await fetch(`${BACKEND_URL}/profile?id=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully!');
        setPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', 'Failed to update profile.');
      }
    } catch (error) {
      Alert.alert('Connection Error', 'Could not connect to server.');
    } finally {
      setSaving(false);
    }
  };

  const initials = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <ScrollView
      className="flex-1 bg-[#0a0a1a]"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />

      {/* Avatar Hero */}
      <View className="items-center pt-10 pb-8 bg-[#0d0d20] border-b border-[#1e1e3a]">
        <View className="w-24 h-24 rounded-3xl bg-[#6C63FF]/20 border-2 border-[#6C63FF] items-center justify-center mb-4">
          <Text className="text-5xl font-bold text-[#6C63FF]">{initials}</Text>
        </View>
        <Text className="text-white text-xl font-bold">{name}</Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-[#9ca3af] text-sm">📱 </Text>
          <Text className="text-[#9ca3af] text-sm">{mobileNumber}</Text>
        </View>
        <View className="mt-2 bg-[#6C63FF]/20 px-3 py-1 rounded-full">
          <Text className="text-[#6C63FF] text-xs font-semibold">Active User</Text>
        </View>
      </View>

      {/* Settings Section */}
      <View className="px-5 pt-6">
        <Text className="text-[#9ca3af] text-xs uppercase tracking-widest mb-3 ml-1">Account Info</Text>

        {/* Name Field */}
        <View className="bg-[#13132b] rounded-2xl border border-[#2a2a4a] mb-3">
          <View className="px-4 pt-3 pb-1">
            <Text className="text-[#6C63FF] text-xs font-semibold mb-1">Display Name</Text>
            <TextInput
              className="text-white text-base py-1"
              placeholder="Your name"
              placeholderTextColor="#4a4a6a"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Mobile (Read-only) */}
        <View className="bg-[#13132b] rounded-2xl border border-[#1a1a2e] mb-3 opacity-60">
          <View className="px-4 pt-3 pb-3">
            <Text className="text-[#6C63FF] text-xs font-semibold mb-1">Mobile Number</Text>
            <Text className="text-[#9ca3af] text-base">{mobileNumber}</Text>
          </View>
          <View className="px-4 pb-2">
            <Text className="text-[#4a4a6a] text-xs">Mobile number cannot be changed</Text>
          </View>
        </View>

        {/* Password Section */}
        <Text className="text-[#9ca3af] text-xs uppercase tracking-widest mt-4 mb-3 ml-1">Change Password</Text>

        <View className="bg-[#13132b] rounded-2xl border border-[#2a2a4a] mb-3">
          <View className="px-4 pt-3 pb-1">
            <Text className="text-[#6C63FF] text-xs font-semibold mb-1">New Password</Text>
            <TextInput
              className="text-white text-base py-1"
              placeholder="Leave blank to keep current"
              placeholderTextColor="#4a4a6a"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <View className="bg-[#13132b] rounded-2xl border border-[#2a2a4a] mb-6">
          <View className="px-4 pt-3 pb-1">
            <Text className="text-[#6C63FF] text-xs font-semibold mb-1">Confirm Password</Text>
            <TextInput
              className="text-white text-base py-1"
              placeholder="Re-enter new password"
              placeholderTextColor="#4a4a6a"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className={`rounded-2xl py-4 items-center mb-4 ${saving ? 'bg-[#4a4a6a]' : 'bg-[#6C63FF]'}`}
          onPress={handleUpdate}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text className="text-white text-base font-bold">
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          className="bg-[#13132b] border border-[#e94560]/40 rounded-2xl py-4 items-center mb-10"
          onPress={() => navigation.replace('LoginSignup')}
          activeOpacity={0.85}
        >
          <Text className="text-[#e94560] text-base font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
