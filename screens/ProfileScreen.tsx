import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const BACKEND_URL = 'http://10.124.63.36:8080/chatapp';

export default function ProfileScreen({ route, navigation }) {
  const { userId, username, mobileNumber } = route.params || {};

  const [name, setName] = useState(username || '');
  const [password, setPassword] = useState('');
  const [displayMobile, setDisplayMobile] = useState(mobileNumber || '');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`${BACKEND_URL}/profile?id=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setName(data.name);
          setDisplayMobile(data.mobile_number);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/profile?id=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password: password || undefined })
      });
      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully!');
        setPassword('');
      } else {
        Alert.alert('Error', 'Failed to update profile.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not connect to the server.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(name || 'U').charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Mobile Number (Cannot be changed)</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={displayMobile}
          editable={false}
        />

        <Text style={styles.label}>New Password (Leave blank to keep current)</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="New Password"
          placeholderTextColor="#888"
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.replace('LoginSignup')}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    color: '#aaa',
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  disabledInput: {
    backgroundColor: '#111',
    color: '#555',
  },
  updateButton: {
    backgroundColor: '#0a84ff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
