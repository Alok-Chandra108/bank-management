# 💳 Bank Management System

A full-stack **MERN** application that simulates core banking features — including user registration, login, deposit, withdraw, fund transfers, and transaction history with filtering. Built with **MongoDB**, **Express**, **React**, **Node.js**, and **Tailwind CSS**.

---

## 🚀 Features

- 👤 User Registration & Login (JWT Auth)
- 💰 Deposit & Withdraw Money
- 🔁 Transfer Funds to Other Users
- 📜 Transaction History
- 🔎 Filter Transactions by Type (Deposit, Withdraw, Transfer)
- 🌐 Protected Routes with JWT Authorization
- 📱 Responsive UI with Tailwind CSS & ShadCN/UI
- ⚙️ RESTful APIs built using Express

---

## 🧱 Tech Stack

| Frontend       | Backend        | Database | Tools & Packages                             |
|----------------|----------------|----------|----------------------------------------------|
| React (Vite)   | Node.js        | MongoDB  | Axios, JWT, Express, Mongoose, bcrypt, dotenv |
| Tailwind CSS   | Express.js     |          | React Router, Vite                            |

---

## 🧑‍💻 Getting Started

### ✅ Prerequisites

- Node.js and npm installed
- MongoDB locally or MongoDB Atlas cluster

---

### 📦 Install Dependencies

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd ../client
npm install
```

---

### 🔐 Setup Environment Variables

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
```

Replace `your_mongo_uri` and `your_jwt_secret` with actual values.

---

### 🏁 Run the Application

#### Start Backend

```bash
cd server
npm run dev
```

#### Start Frontend

```bash
cd ../client
npm run dev
```

The frontend will be available at:  
**http://localhost:5173**

The backend runs on:  
**http://localhost:5000**

---

## 🧪 Transaction Filter

On the **Transaction History** page, users can:

- View all transactions (Deposit, Withdraw, Transfer)
- Filter transactions by **type**
- See real-time updates after each transaction

---

## 💳 Virtual Credit Card Feature:
- Users can apply for a virtual debit card.
- An issuance process with a real-time countdown timer.
- Once active, an interactive 3D virtual card is displayed with hover effects, tilt, and a subtle shimmer.
- Card details (number, holder, expiry, type) are dynamically shown.

---

## 🛠️ Future Enhancements

- Admin Panel with User Management
- Dark Mode Toggle
- Export Transaction History as PDF/CSV

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
