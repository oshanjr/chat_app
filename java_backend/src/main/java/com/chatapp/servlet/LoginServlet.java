package com.chatapp.servlet;

import com.chatapp.entity.User;
import com.chatapp.util.HibernateUtil;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.hibernate.Session;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        JsonObject requestBody = new Gson().fromJson(request.getReader(), JsonObject.class);
        String mobile = requestBody.get("mobile_number").getAsString();
        String password = requestBody.get("password").getAsString();

        JsonObject jsonResponse = new JsonObject();

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            User user = (User) session.createQuery("FROM User u WHERE u.contactNumber = :mobile")
                    .setParameter("mobile", mobile)
                    .uniqueResult();

            if (user == null || !user.getPassword().equals(password)) {
                jsonResponse.addProperty("error", "Invalid credentials");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            } else {
                jsonResponse.addProperty("id", user.getId());
                jsonResponse.addProperty("name", user.getUsername());
                jsonResponse.addProperty("mobile_number", user.getContactNumber());
                response.setStatus(HttpServletResponse.SC_OK);
            }
        } catch (Exception e) {
            e.printStackTrace();
            jsonResponse.addProperty("error", "Internal server error");
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }

        response.getWriter().write(jsonResponse.toString());
    }
}
