package com.chatapp.servlet;

import com.chatapp.entity.User;
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

@WebServlet("/users")
public class UsersServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String currentUserIdStr = request.getParameter("current_user_id");

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            List<User> users;
            if (currentUserIdStr != null && !currentUserIdStr.isEmpty()) {
                int currentUserId = Integer.parseInt(currentUserIdStr);
                users = session.createQuery("FROM User u WHERE u.id != :id", User.class)
                        .setParameter("id", currentUserId)
                        .list();
            } else {
                users = session.createQuery("FROM User", User.class).list();
            }

            JsonArray jsonArray = new JsonArray();
            for (User u : users) {
                JsonObject obj = new JsonObject();
                obj.addProperty("id", u.getId());
                obj.addProperty("name", u.getUsername());
                obj.addProperty("mobile_number", u.getContactNumber());
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
