# 🛡️ Full Stack Secure Authentication System

A modern, production-ready authentication system built with **NestJS** (backend) and **React + Vite** (frontend), featuring:

- Secure signup and login
- OTP email verification
- Google reCAPTCHA v2
- Strong password policies
- JWT authentication (access + refresh)
- Role-based access control (admin/user)
- Forgot/reset password flow
- MongoDB with TypeORM integration

---

## 🔧 Tech Stack

### Backend
- **NestJS**
- **MongoDB** (via TypeORM)
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Nodemailer** for OTP emails
- **Helmet + Rate Limiting** for security
- **Throttler** to prevent brute-force
- **Role Guards** and admin seeding

### Frontend
- **React 19** + **Vite**
- **React Hook Form** + **Zod** for form validation
- **React Query** for data fetching
- **TailwindCSS** for styling
- **Google reCAPTCHA v2**
- **Hot Toast** for notifications
- **Axios** for API requests
- **Context API** for auth management

---

## ⚙️ Features

### 🔐 Authentication
- Signup with:
  - Full name
  - Email
  - Username (lowercase, numbers, `_`, `-`, `.` only)
  - Strong password (8+ chars, uppercase, lowercase, symbol, number)
  - Google reCAPTCHA v2
- Email verification with OTP (10 min expiry)
- Login with email **or** username
- JWT Access Token (15 min) + Refresh Token (7 days)
- Refresh token rotation
- Secure cookies or header-based token transfer

### 🔄 Forgot Password Flow
1. Enter email → Receive OTP
2. Enter OTP → Verified
3. Reset new password (same strength rules)
4. Previous passwords allowed if strong

### 🧱 Roles & Authorization
- Role-based guard (admin, user)
- Admin seeded from CLI using `npm run seed:admin`
- Protected routes like `/auth/admin-only`

---

## 📦 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/secure-auth-system.git
cd secure-auth-system
