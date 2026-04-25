package com.chatapp.servlet;

import com.chatapp.entity.Message;
import com.chatapp.util.HibernateUtil;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.hibernate.Session;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet("/history")
public class HistoryServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String userIdParam = request.getParameter("userId");
        String chatIdParam = request.getParameter("chatId");

        if (userIdParam == null || chatIdParam == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\":\"Missing userId or chatId\"}");
            return;
        }

        int chatId = Integer.parseInt(chatIdParam);

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            List<Message> messages = session.createQuery(
                    "FROM Message m WHERE m.chat.chatId = :chatId ORDER BY m.timestamp ASC", Message.class)
                    .setParameter("chatId", chatId)
                    .list();

            JsonArray jsonArray = new JsonArray();
            for (Message m : messages) {
                JsonObject obj = new JsonObject();
                obj.addProperty("messageId", m.getMessageId());
                obj.addProperty("text", m.getText());
                obj.addProperty("senderId", m.getSender().getId());
                obj.addProperty("timestamp", m.getTimestamp().toString());
                jsonArray.add(obj);
            }

            response.getWriter().write(new Gson().toJson(jsonArray));
            response.setStatus(HttpServletResponse.SC_OK);

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"Internal server error\"}");
        }
    }
}
