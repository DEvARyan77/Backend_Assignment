
---

## 📁 Features

- 🔐 Customer Authentication (Signup & Login with JWT & Cookies)
- 📋 Plan-based Subscriptions (Create, Get, Update, Cancel)
- ⏰ Scheduled Cron Job to expire subscriptions daily at midnight
- 🔁 MongoDB (with Mongoose) + Redis + Retry logic

---

## 🛠 Tech Stack

- Node.js / Express.js
- MongoDB + Mongoose
- Redis (for retry logic)
- JWT Authentication
- Vercel Serverless Deployment
- Vercel Cron Jobs

---

## 📂 Project Structure

.
├── cluster.js # Express app entry point
├── models/
│ ├── customer.js
│ ├── plan.js
│ └── subscription.js
├── routes/
│ ├── auth.js
│ └── subscription.js
├── utils/
│ └── retry.js
├── vercel.json # Vercel routing & cron config
├── .env # Environment variables (ignored)
└── README.md


---

## 🔐 Authentication API

### ✅ Signup  
`POST /api/v1/users/signup`  
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

POST /api/v1/users/login

json
Copy
Edit
{
  "email": "john@example.com",
  "password": "password123"
}
Returns: HTTP-only cookie with JWT

📦 Subscription API
📄 Create Subscription
POST /api/v1/users/subscriptions

json
Copy
Edit
{
  "planName": "Basic"
}
📑 Get Active Subscriptions
GET /api/v1/subscriptions

✏️ Update Subscription
PATCH /api/v1/subscriptions

json
Copy
Edit
{
  "status": "ACTIVE"
}
❌ Cancel Subscription
DELETE /api/v1/users/subscriptions

json
Copy
Edit
{
  "planName": "Basic"
}
⏰ Cron Job (Auto Expiry)
Defined in vercel.json as:

json
Copy
Edit
"crons": [
  {
    "path": "/api/v1/cron/expire-subscriptions",
    "schedule": "0 0 * * *"
  }
]
This runs /api/v1/cron/expire-subscriptions daily at midnight (UTC) to automatically expire outdated subscriptions.

🔧 Environment Variables (.env)
ini
Copy
Edit
MONGO_URI=your_mongodb_uri
REDIS_URL=your_redis_url
SECRET_KEY=your_jwt_secret
Note: These are kept secret via .gitignore.

🧪 Local Development
bash
Copy
Edit
npm install
node cluster.js
Runs Express locally on http://localhost:3000

⚙️ Deployment on Vercel
The entry point is set in vercel.json:

json
Copy
Edit
"builds": [
  { "src": "cluster.js", "use": "@vercel/node" }
],
"routes": [
  { "src": "/api/(.*)", "dest": "cluster.js" }
]
All API routes are routed through cluster.js.

🙋‍♂️ Author
Dev Aryan
