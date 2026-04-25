import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const BACKEND_URL = 'http://10.124.63.36:8080/chatapp';

export default function LoginSignupScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const handleAuth = async () => {
    if (!mobileNumber || !password || (!isLogin && !name)) {
      Alert.alert("Error", "Please fill in all required fields.");
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
        body: JSON.stringify(body)
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        console.error('Non-JSON response received:', responseText);
        Alert.alert("Error", "Server returned an unexpected response. Please check logs.");
        return;
      }

      if (response.ok) {
        navigation.replace('ChatList', { userId: data.id, username: data.name, mobileNumber: data.mobile_number });
      } else {
        Alert.alert("Error", data.error || "Authentication failed");
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert("Error", "Could not connect to the server.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>

      <View style={styles.inputContainer}>
        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          value={mobileNumber}
          onChangeText={setMobileNumber}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>{isLogin ? 'Log In' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.toggleText}>
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
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
  button: {
    backgroundColor: '#0a84ff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleText: {
    color: '#0a84ff',
    textAlign: 'center',
    fontSize: 16,
  },
});
