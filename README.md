# NovaCart E-Commerce Platform

NovaCart is a full-stack, enterprise-grade e-commerce platform built on the MERN stack (MongoDB, Express, React, Node.js). It features secure user authentication, an advanced product filtering engine, seamless Stripe payment integration, Cloudinary image hosting, and a robust admin dashboard for inventory and order management.

The frontend has been elevated with premium UI techniques, including glassmorphism, responsive Tailwind design, and fluid, physics-based Framer Motion animations.

## Tech Stack
- **Frontend**: React (Vite), Redux Toolkit, Tailwind CSS, Framer Motion, Axios
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Services**: Cloudinary (Image Hosting), Stripe (Payments), Nodemailer (Email)

## Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas URI)

## Installation & Setup

### 1. Clone the repository
Make sure you are in the project root folder `vagueflow`.

### 2. Backend Setup
Navigate into the `backend` directory and install dependencies:
```bash
cd backend
npm install
```

**Environment Variables**:
Create a `.env` file in the `backend` folder with the following configuration:

```env
PORT=4000
DB_URI=mongodb://localhost:27017/NovaCart # Or your MongoDB Atlas connection string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=5d
COOKIE_EXPIRE=5

# Stripe Configuration
STRIPE_API_KEY=your_stripe_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Cloudinary Configuration (Required for product images)
CLOUDINARY_CLIENT_NAME=your_cloudinary_name
CLOUDINARY_CLIENT_API=your_cloudinary_api_key
CLOUDINARY_CLIENT_SECRET=your_cloudinary_api_secret

# Email Configuration (For Password Resets)
SMTP_SERVICE=gmail
SMTP_MAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465

FRONTEND_URL=http://localhost:5173
```

Start the backend development server:
```bash
npm run dev
```
*The backend should now be running on `http://localhost:4000`.*

### 3. Frontend Setup
Open a new terminal window, navigate into the `frontend` directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*The frontend should now be running on `http://localhost:5173`.*

## Features Overview
- **Authentication**: JWT-based login, registration, and secure password recovery.
- **Product Discovery**: Dynamic search, debounced filtering, multi-category support, and advanced MongoDB sorting.
- **Shopping Cart & Wishlist**: Persistent cart, hybrid wishlist (supports both guests and logged-in users), and coupon application.
- **Checkout**: Multi-step checkout process with integrated Stripe test payments.
- **Admin Dashboard**: Secured routes for user management, real-time analytics charts, and comprehensive order/product CRUD operations with multi-image Cloudinary uploads.
- **Premium UX**: Responsive skeleton loaders, staggered grid layout animations, glassmorphic headers, and beautifully styled empty/error states.
# vogue_flow
