# Deployment Guide for CodeReviewAI

This guide will help you deploy your full-stack application to Vercel for free.

## Prerequisites

1. A GitHub repository with your code
2. A Vercel account
3. A MongoDB Atlas account with a free cluster

## Deployment Steps

### 1. Prepare Your Code

Make sure all your code is committed and pushed to your GitHub repository.

### 2. Set Up Environment Variables

In your Vercel dashboard, you'll need to set up the following environment variables:

For the backend:

- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret key
- `PORT` - Set to 3000 (Vercel's default)

### 3. Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in/up
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:

   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm install && cd frontend && npm install`

5. Add the environment variables in the "Environment Variables" section
6. Click "Deploy"

### 4. Update Frontend Environment Variables

After your backend is deployed, you'll get a URL for your backend. Update the `VITE_API_URL` in your frontend's `.env` file to point to your deployed backend URL:

```
VITE_API_URL=https://your-backend-url.vercel.app
```

### 5. Redeploy Frontend

After updating the environment variable, redeploy your frontend to Vercel.

## Troubleshooting

If you encounter any issues:

1. Check that all environment variables are correctly set
2. Ensure your MongoDB Atlas cluster has the correct IP whitelist (0.0.0.0/0 for testing)
3. Verify that your backend API routes are correctly configured

## Cost

This deployment is completely free:

- Vercel provides free hosting for both frontend and backend
- MongoDB Atlas provides a free tier for the database
