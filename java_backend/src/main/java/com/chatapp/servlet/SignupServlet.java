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

@WebServlet("/signup")
public class SignupServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        JsonObject requestBody = new Gson().fromJson(request.getReader(), JsonObject.class);
        String name = requestBody.get("name").getAsString();
        String mobile = requestBody.get("mobile_number").getAsString();
        String password = requestBody.get("password").getAsString(); // In real app, hash this

        JsonObject jsonResponse = new JsonObject();

        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();

            Long count = (Long) session.createQuery("SELECT COUNT(u) FROM User u WHERE u.contactNumber = :mobile")
                    .setParameter("mobile", mobile)
                    .uniqueResult();

            if (count > 0) {
                jsonResponse.addProperty("error", "Mobile number already registered");
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            } else {
                User user = new User(name, password, mobile);
                session.save(user);
                transaction.commit();

                jsonResponse.addProperty("id", user.getId());
                jsonResponse.addProperty("name", user.getUsername());
                jsonResponse.addProperty("mobile_number", user.getContactNumber());
                response.setStatus(HttpServletResponse.SC_CREATED);
            }
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            e.printStackTrace();
            jsonResponse.addProperty("error", "Internal server error");
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }

        response.getWriter().write(jsonResponse.toString());
    }
}
