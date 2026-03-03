# 🍕 Sspice Pizza – Online Ordering System

Sspice Pizza is a modern full-stack pizza ordering web application built with React, TypeScript, and Supabase.  
It allows customers to browse pizzas, place orders, and track delivery status, while admins manage products and orders.

---

## 🚀 Live Features

### 👤 Customer
- Browse Veg & Non-Veg pizzas
- Add to cart
- Place order
- Order status tracking

### 🚚 Delivery Panel
- View assigned orders
- Update order status
- Track "Out for Delivery"

### 🛠 Admin Panel
- Manage products
- Manage orders
- Role-based access (Admin / Delivery / User)

---

## 🛠 Tech Stack

**Frontend**
- React (Vite)
- TypeScript
- Tailwind CSS
- Shadcn UI

**Backend**
- Supabase (PostgreSQL)
- Supabase Authentication
- Role-based Access Control

---

## 📂 Project Structure


src/
├── components/
├── pages/
├── context/
├── lib/
├── hooks/
public/


---

## 🔐 Environment Setup

Create a `.env` file in the root directory:


VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key


⚠️ Never commit your `.env` file.

---

## 📦 Installation

```bash
git clone https://github.com/RohanM0205/sspice-pizza.git
cd sspice-pizza
npm install
npm run dev


---

👨‍💻 Author
Rohan More Software Developer - HDFC ERGO