import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';

const BACKEND_URL = 'http://10.124.63.36:8080/chatapp';
const WS_URL = 'ws://10.124.63.36:8080/chatapp/chat';

export default function ChatWindowScreen({ route, navigation }) {
  const { chatId, userId, chatName } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const wsRef = useRef(null);
  const flatListRef = useRef(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: chatName });
  }, [navigation, chatName]);

  useEffect(() => {
    // Fetch historical messages
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/history?userId=${userId}&chatId=${chatId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    // Connect to native WebSocket Server
    wsRef.current = new WebSocket(`${WS_URL}/${chatId}`);

    wsRef.current.onopen = () => {
      console.log('Connected to Java WebSocket');
    };

    wsRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages(prev => [...prev, msg]);
    };

    wsRef.current.onerror = (e) => {
      console.error('WebSocket error:', e.message);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [chatId, userId]);

  const sendMessage = () => {
    if (inputText.trim() && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        senderId: userId,
        text: inputText.trim()
      };
      wsRef.current.send(JSON.stringify(payload));
      setInputText('');
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === userId;
    // Attempt to parse standard Java Date string or just use as is
    let timeString = item.timestamp;
    try {
      if (item.timestamp) {
        const d = new Date(item.timestamp);
        if (!isNaN(d.getTime())) {
          timeString = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }
    } catch (e) {}

    return (
      <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.otherBubble]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>{timeString}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#0a84ff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item.messageId ? item.messageId.toString() : index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 15 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  messageBubble: {
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '80%',
  },
  myBubble: {
    backgroundColor: '#0a84ff',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  otherBubble: {
    backgroundColor: '#1e1e1e',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  messageTime: {
    color: '#ccc',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#1e1e1e',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#2c2c2e',
    color: '#fff',
    padding: 12,
    borderRadius: 20,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#0a84ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
