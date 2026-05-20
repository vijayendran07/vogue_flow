# Deployment Guide (Vercel + Render)

This project should be deployed as:
- Frontend (`frontend`) -> Vercel
- Backend (`backend`) -> Render (Web Service)

## 1. Deploy Backend on Render

1. Push this repo to GitHub.
2. In Render, create a new `Web Service` from the repo.
3. Use these settings:
- Root Directory: `vagueflow/backend`
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`

4. Add environment variables in Render:
- `NODE_ENV=production`
- `MONGO_URI=<your_mongodb_atlas_uri>`
- `FRONTEND_URL=<your_vercel_frontend_url>`
- `JWT_SECRET=<strong_random_secret>`
- `JWT_EXPIRE=5d`
- `COOKIE_EXPIRE=5`
- `RAZORPAY_KEY_ID=<your_key>`
- `RAZORPAY_KEY_SECRET=<your_secret>`
- `CLOUDINARY_NAME=<your_cloudinary_name>`
- `CLOUDINARY_API_KEY=<your_cloudinary_api_key>`
- `CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>`

Optional (if using email/password reset):
- `SMTP_SERVICE`
- `SMTP_MAIL`
- `SMTP_PASSWORD`
- `SMTP_HOST`
- `SMTP_PORT`

Optional (if using Google login):
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI=<your_frontend_url>/auth/google/callback`

5. Deploy and copy the Render URL, for example:
- `https://your-backend.onrender.com`

## 2. Deploy Frontend on Vercel

1. In Vercel, import the same GitHub repo.
2. Configure:
- Root Directory: `vagueflow/frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

3. Add Vercel environment variables:
- `VITE_API_URL=https://your-backend.onrender.com/api/v1`
- `VITE_GOOGLE_CLIENT_ID=<if_using_google_login>`
- `VITE_GOOGLE_REDIRECT_URI=https://your-frontend.vercel.app/auth/google/callback`

4. Deploy.

The included `frontend/vercel.json` rewrite ensures direct refresh on routes like `/products` works correctly.

## 3. Final Cross-Origin Check

After frontend deploy is done, update Render:
- `FRONTEND_URL=https://your-frontend.vercel.app`

Then redeploy Render once so backend CORS allows your Vercel domain.

## 4. Quick Smoke Test

1. Open frontend URL.
2. Check home/products load.
3. Register/login.
4. Add item to cart and place a test order.
5. Verify backend root (`https://your-backend.onrender.com/`) responds.
