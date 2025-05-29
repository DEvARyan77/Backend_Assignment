# 🧠 Subscription Management API

A RESTful backend API for managing customer subscriptions, built with **Express.js**, **MongoDB**, **Zod**, and **JWT authentication**. It supports both **customer** and **admin** operations with scheduled subscription expiration logic.

## 🌐 Deployment URLs

- **Customer API Base URL:** `https://backend-assignment-uh4k.onrender.com/api/v1/users`
- **Admin API Base URL:** `https://backend-assignment-uh4k.onrender.com/api/v1/admin`
- **Cron Job (Vercel):** `/api/v1/cron/expire-subscriptions` (runs daily)

---

## 🚀 Features

### 👤 Customer APIs
- `POST /signup` – Register a new customer
- `POST /login` – Login and receive a JWT token
- `POST /subscriptions` – Create a subscription
- `GET /subscriptions` – Fetch active subscriptions
- `PUT /subscriptions` – Update subscription status
- `DELETE /subscriptions` – Cancel a subscription

> All subscription routes require authentication via JWT.

---

### 🛠️ Admin APIs
- `POST /login` – Login as admin (no signup)
- `POST /plans` – Create a new plan
- `GET /plans` – Fetch all plans
- `GET /plans/:id` – Fetch a specific plan by ID
- `GET /plans/name/:planName` – Fetch a plan by name

> All admin routes require admin-level JWT authentication.

---

## ✅ Technologies Used

- **Node.js + Express.js** – Web server
- **MongoDB + Mongoose** – Database
- **Zod** – Schema validation
- **JWT** – Authentication
- **Redis** (optional) – Caching/session support
- **Vercel + Render** – Hosting and scheduled cron jobs

---

## 🧪 Validation

### Zod Schemas

- **Customer**
  - `signupSchema` – Validates name, email, and password
  - `loginSchema` – Validates email and password
- **Subscription**
  - `createSubscriptionSchema` – Requires `planName`
  - `updateSubscriptionSchema` – Requires `planName` + `status`
  - `cancelSubscriptionSchema` – Requires `planName`
- **Plan (Admin)**
  - `createPlanSchema` – Validates name, price, duration, and features

---

## 🔒 Authentication

Add the JWT token to the `Authorization` header:

```http
Authorization: Bearer <your_token_here>
