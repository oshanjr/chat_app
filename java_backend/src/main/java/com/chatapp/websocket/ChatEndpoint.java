package com.chatapp.websocket;

import com.chatapp.entity.Chat;
import com.chatapp.entity.Message;
import com.chatapp.entity.User;
import com.chatapp.util.HibernateUtil;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.hibernate.Transaction;

import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@ServerEndpoint("/chat/{chatId}")
public class ChatEndpoint {

    // Maps chatId to a set of active sessions
    private static final ConcurrentHashMap<String, Set<Session>> chatRooms = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("chatId") String chatId) {
        chatRooms.putIfAbsent(chatId, Collections.synchronizedSet(new HashSet<>()));
        chatRooms.get(chatId).add(session);
        
        // Mark messages in this chat as SEEN when someone joins
        try (org.hibernate.Session dbSession = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = dbSession.beginTransaction();
            dbSession.createQuery("UPDATE Message m SET m.status = 'SEEN' WHERE m.chat.chatId = :cId")
                    .setParameter("cId", Integer.parseInt(chatId))
                    .executeUpdate();
            tx.commit();
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        System.out.println("Session " + session.getId() + " joined chat " + chatId);
    }

    @OnMessage
    public void onMessage(String messageJson, Session session, @PathParam("chatId") String chatId) {
        Gson gson = new Gson();
        JsonObject json = gson.fromJson(messageJson, JsonObject.class);
        
        int senderId = json.get("senderId").getAsInt();
        String text = json.get("text").getAsString();

        // Save to Database
        Transaction transaction = null;
        try (org.hibernate.Session dbSession = HibernateUtil.getSessionFactory().openSession()) {
            transaction = dbSession.beginTransaction();
            
            Chat chat = dbSession.get(Chat.class, Integer.parseInt(chatId));
            User sender = dbSession.get(User.class, senderId);
            
            if (chat != null && sender != null) {
                Message message = new Message();
                message.setChat(chat);
                message.setSender(sender);
                message.setText(text);
                
                dbSession.save(message);
                transaction.commit();

                // Add generated ID and timestamp to broadcast
                json.addProperty("messageId", message.getMessageId());
                json.addProperty("timestamp", new java.util.Date().toString());
            }
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            e.printStackTrace();
        }

        // Broadcast to everyone in the chat room
        String broadcastMessage = gson.toJson(json);
        Set<Session> roomSessions = chatRooms.get(chatId);
        if (roomSessions != null) {
            for (Session s : roomSessions) {
                if (s.isOpen()) {
                    try {
                        s.getBasicRemote().sendText(broadcastMessage);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }

    @OnClose
    public void onClose(Session session, @PathParam("chatId") String chatId) {
        Set<Session> roomSessions = chatRooms.get(chatId);
        if (roomSessions != null) {
            roomSessions.remove(session);
        }
        System.out.println("Session " + session.getId() + " left chat " + chatId);
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        System.err.println("WebSocket Error on session " + session.getId() + ": " + throwable.getMessage());
    }
}
