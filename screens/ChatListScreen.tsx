import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const BACKEND_URL = 'http://10.124.63.36:8080/chatapp';

export default function ChatListScreen({ navigation, route }) {
  const { userId, username, mobileNumber } = route.params || {};
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId, username, mobileNumber })}>
          <Text style={{ color: '#0a84ff', fontSize: 16, marginRight: 15 }}>Profile</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, userId, username, mobileNumber]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchUsers = async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/users?current_user_id=${userId}`);
          if (response.ok) {
            const data = await response.json();
            setUsers(data);
          }
        } catch (error) {
          console.error('Error fetching users:', error);
        } finally {
          setLoading(false);
        }
      };
      
      if (userId) {
        fetchUsers();
      }
    }, [userId])
  );

  const handleChatPress = async (otherUser) => {
    try {
      const response = await fetch(`${BACKEND_URL}/chat-init?user1=${userId}&user2=${otherUser.id}`);
      if (response.ok) {
        const data = await response.json();
        navigation.navigate('ChatWindow', { 
          chatId: data.chatId, 
          chatName: otherUser.name, 
          userId 
        });
      } else {
        console.error('Failed to initialize chat');
      }
    } catch (error) {
      console.error('Error connecting to chat:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.chatDetails}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.mobile_number}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>Tap to chat</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#0a84ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {users.length === 0 ? (
        <Text style={styles.emptyText}>No users found. Invite some friends!</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 10 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatDetails: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  chatName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatTime: {
    color: '#888',
    fontSize: 12,
  },
  lastMessage: {
    color: '#aaa',
    fontSize: 14,
  },
});
