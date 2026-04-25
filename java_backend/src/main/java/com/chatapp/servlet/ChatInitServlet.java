package com.chatapp.servlet;

import com.chatapp.entity.Chat;
import com.chatapp.entity.User;
import com.chatapp.util.HibernateUtil;
import com.google.gson.JsonObject;
import org.hibernate.Session;
import org.hibernate.Transaction;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet("/chat-init")
public class ChatInitServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            int user1Id = Integer.parseInt(request.getParameter("user1"));
            int user2Id = Integer.parseInt(request.getParameter("user2"));

            try (Session session = HibernateUtil.getSessionFactory().openSession()) {
                // Find existing chat containing exactly these two users
                String query = "SELECT c.chatId FROM Chat c " +
                               "JOIN c.participants p1 " +
                               "JOIN c.participants p2 " +
                               "WHERE p1.id = :u1 AND p2.id = :u2";
                               
                List<Integer> existingChats = session.createQuery(query, Integer.class)
                        .setParameter("u1", user1Id)
                        .setParameter("u2", user2Id)
                        .list();

                int finalChatId;
                if (!existingChats.isEmpty()) {
                    finalChatId = existingChats.get(0);
                } else {
                    // Create new chat
                    Transaction tx = session.beginTransaction();
                    try {
                        Chat newChat = new Chat();
                        User u1 = session.get(User.class, user1Id);
                        User u2 = session.get(User.class, user2Id);
                        
                        if (u1 != null && u2 != null) {
                            newChat.getParticipants().add(u1);
                            newChat.getParticipants().add(u2);
                            session.save(newChat);
                            finalChatId = newChat.getChatId();
                            tx.commit();
                        } else {
                            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                            return;
                        }
                    } catch (Exception e) {
                        tx.rollback();
                        throw e;
                    }
                }

                JsonObject json = new JsonObject();
                json.addProperty("chatId", finalChatId);
                response.getWriter().write(json.toString());
                response.setStatus(HttpServletResponse.SC_OK);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
