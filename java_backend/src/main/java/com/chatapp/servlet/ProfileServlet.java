package com.chatapp.servlet;

import com.chatapp.entity.User;
import com.chatapp.util.HibernateUtil;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.hibernate.Session;
import org.hibernate.Transaction;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/profile")
public class ProfileServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String idStr = request.getParameter("id");
        if (idStr == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            User user = session.get(User.class, Integer.parseInt(idStr));
            if (user != null) {
                JsonObject obj = new JsonObject();
                obj.addProperty("id", user.getId());
                obj.addProperty("name", user.getUsername());
                obj.addProperty("mobile_number", user.getContactNumber());
                response.getWriter().write(obj.toString());
                response.setStatus(HttpServletResponse.SC_OK);
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String idStr = request.getParameter("id");
        if (idStr == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        JsonObject requestBody = new Gson().fromJson(request.getReader(), JsonObject.class);
        String name = requestBody.has("name") ? requestBody.get("name").getAsString() : null;
        String password = requestBody.has("password") ? requestBody.get("password").getAsString() : null;

        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            User user = session.get(User.class, Integer.parseInt(idStr));
            
            if (user != null) {
                if (name != null) user.setUsername(name);
                if (password != null && !password.isEmpty()) user.setPassword(password);
                
                session.update(user);
                transaction.commit();
                
                JsonObject obj = new JsonObject();
                obj.addProperty("message", "Profile updated successfully");
                response.getWriter().write(obj.toString());
                response.setStatus(HttpServletResponse.SC_OK);
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
