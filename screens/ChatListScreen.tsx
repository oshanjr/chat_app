import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const BACKEND_URL = 'http://10.124.63.36:8080/chatapp';

const AVATAR_COLORS = ['#6C63FF', '#e94560', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export default function ChatListScreen({ navigation, route }) {
  const { userId, username, mobileNumber } = route.params || {};
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Chats',
      headerStyle: { backgroundColor: '#0a0a1a' },
      headerTintColor: '#EAEAEA',
      headerTitleStyle: { fontWeight: 'bold', fontSize: 22 },
      headerRight: () => (
        <TouchableOpacity
          className="mr-4 bg-[#6C63FF] w-9 h-9 rounded-full items-center justify-center"
          onPress={() => navigation.navigate('Profile', { userId, username, mobileNumber })}
        >
          <Text className="text-white font-bold text-base">
            {username ? username.charAt(0).toUpperCase() : '?'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, userId, username, mobileNumber]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchUsers = async () => {
        // Only show loading if we don't have users yet to prevent flicker and state reset
        if (users.length === 0) setLoading(true);
        
        try {
          const response = await fetch(`${BACKEND_URL}/users?current_user_id=${userId}`);
          if (response.ok) {
            const data = await response.json();
            // Preserve our local 'hasBeenSeen' and 'unreadCount' status when updating the list
            setUsers(prevUsers => {
              return data.map(newUser => {
                const existingUser = prevUsers.find(u => u.id === newUser.id);
                if (existingUser) {
                  return { ...newUser, ...existingUser }; // Keep local state like hasBeenSeen
                }
                return newUser;
              });
            });
          }
        } catch (error) {
          console.error('Error fetching users:', error);
        } finally {
          setLoading(false);
        }
      };
      if (userId) fetchUsers();
    }, [userId, users.length])
  );

  const handleChatPress = async (otherUser) => {
    // Correctly update local state to clear the unread count
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === otherUser.id ? { ...u, unreadCount: 0, hasBeenSeen: true } : u
      )
    );
    
    try {
      const response = await fetch(`${BACKEND_URL}/chat-init?user1=${userId}&user2=${otherUser.id}`);
      if (response.ok) {
        const data = await response.json();
        navigation.navigate('ChatWindow', {
          chatId: data.chatId,
          chatName: otherUser.name,
          userId,
        });
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const renderItem = ({ item, index }) => {
    const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
    const initials = item.name ? item.name.charAt(0).toUpperCase() : '?';
    
    // Only show count if it's explicitly provided in the data (no simulation)
    const displayCount = item.unreadCount || 0;

    return (
      <TouchableOpacity
        className="flex-row items-center bg-[#13132b] mx-4 mb-3 p-4 rounded-2xl border border-[#2a2a4a] active:opacity-70"
        onPress={() => handleChatPress(item)}
        activeOpacity={0.75}
      >
        {/* Avatar */}
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
          style={{ backgroundColor: color + '33' }}
        >
          <Text className="text-2xl font-bold" style={{ color }}>{initials}</Text>
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-white font-semibold text-base">{item.name}</Text>
          <Text className="text-[#9ca3af] text-sm mt-0.5">{item.mobile_number}</Text>
        </View>

        {/* Unread Count Bubble */}
        {displayCount > 0 && (
          <View className="bg-[#6C63FF] min-w-[24px] h-6 rounded-full items-center justify-center px-1.5 mr-2">
            <Text className="text-white text-xs font-bold">{displayCount}</Text>
          </View>
        )}

        {/* Arrow */}
        <View className="bg-[#1e1e3a] rounded-full w-8 h-8 items-center justify-center">
          <Text className="text-[#6C63FF] text-base">›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0a0a1a] items-center justify-center">
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text className="text-[#9ca3af] mt-3">Loading contacts...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0a0a1a]">
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />

      {/* Welcome Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-[#9ca3af] text-sm">
          Welcome back, <Text className="text-[#6C63FF] font-semibold">{username}</Text>
        </Text>
        <Text className="text-white text-xl font-bold mt-1">
          {users.length} {users.length === 1 ? 'Contact' : 'Contacts'} Available
        </Text>
      </View>

      {users.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-6xl mb-4">👥</Text>
          <Text className="text-white text-xl font-semibold text-center">No contacts yet</Text>
          <Text className="text-[#9ca3af] text-center mt-2">When other users sign up, they will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
