import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar
} from 'react-native';

const BACKEND_URL = 'http://10.124.63.36:8080/chatapp';
const WS_URL = 'ws://10.124.63.36:8080/chatapp/chat';

export default function ChatWindowScreen({ route, navigation }) {
  const { chatId, userId, chatName } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const flatListRef = useRef(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: chatName,
      headerStyle: { backgroundColor: '#0a0a1a' },
      headerTintColor: '#EAEAEA',
      headerTitleStyle: { fontWeight: 'bold' },
    });
  }, [navigation, chatName]);

  useEffect(() => {
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

    wsRef.current = new WebSocket(`${WS_URL}/${chatId}`);

    wsRef.current.onopen = () => {
      setConnected(true);
      console.log('Connected to Java WebSocket');
    };

    wsRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages(prev => [...prev, msg]);
    };

    wsRef.current.onerror = (e) => {
      setConnected(false);
      console.error('WebSocket error:', e.message);
    };

    wsRef.current.onclose = () => {
      setConnected(false);
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [chatId, userId]);

  const sendMessage = () => {
    if (inputText.trim() && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const payload = { senderId: userId, text: inputText.trim() };
      wsRef.current.send(JSON.stringify(payload));
      setInputText('');
    }
  };

  const formatTime = (timestamp) => {
    try {
      if (!timestamp) return '';
      const d = new Date(timestamp);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } catch (e) {}
    return '';
  };

  const renderMessage = ({ item, index }) => {
    const isMe = String(item.senderId) === String(userId);
    const timeStr = formatTime(item.timestamp);
    const prevItem = index > 0 ? messages[index - 1] : null;
    const isFirstInGroup = !prevItem || String(prevItem.senderId) !== String(item.senderId);

    return (
      <View className={`px-4 ${isFirstInGroup ? 'mt-3' : 'mt-1'} ${isMe ? 'items-end' : 'items-start'}`}>
        <View
          className={`rounded-3xl px-4 py-3 max-w-[78%] ${
            isMe
              ? 'bg-[#6C63FF] rounded-br-md'
              : 'bg-[#13132b] border border-[#2a2a4a] rounded-bl-md'
          }`}
        >
          <Text className="text-white text-base leading-5">{item.text}</Text>
          {timeStr ? (
            <Text className={`text-xs mt-1 ${isMe ? 'text-[#c5c2ff]' : 'text-[#6b7280]'} text-right`}>
              {timeStr}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0a0a1a] items-center justify-center">
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text className="text-[#9ca3af] mt-3">Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0a0a1a]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />

      {/* Connection status bar */}
      {!connected && !loading && (
        <View className="bg-[#e94560] px-4 py-2 items-center">
          <Text className="text-white text-xs font-medium">Connecting to chat...</Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) =>
          item.messageId ? item.messageId.toString() : `tmp-${index}`
        }
        renderItem={renderMessage}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Text className="text-5xl mb-3">👋</Text>
            <Text className="text-white font-semibold text-lg">Say hello!</Text>
            <Text className="text-[#9ca3af] text-sm mt-1 text-center px-8">
              This is the beginning of your conversation with {chatName}.
            </Text>
          </View>
        }
      />

      {/* Input Area */}
      <View className="flex-row items-end px-3 py-3 bg-[#0d0d20] border-t border-[#1e1e3a]">
        <View className="flex-1 bg-[#13132b] rounded-3xl px-4 py-3 border border-[#2a2a4a] mr-2 min-h-[46px] max-h-[110px] justify-center">
          <TextInput
            className="text-white text-base"
            placeholder="Message..."
            placeholderTextColor="#4a4a6a"
            value={inputText}
            onChangeText={setInputText}
            multiline
            onSubmitEditing={sendMessage}
          />
        </View>
        <TouchableOpacity
          className={`w-12 h-12 rounded-full items-center justify-center ${
            inputText.trim() ? 'bg-[#6C63FF]' : 'bg-[#2a2a4a]'
          }`}
          onPress={sendMessage}
          activeOpacity={0.8}
        >
          <Text className="text-white text-xl">➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
