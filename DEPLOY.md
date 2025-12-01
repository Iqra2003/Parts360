# Deployment Guide

This application is configured for easy deployment on platforms like **Render**, **Railway**, or **Heroku**.

## Recommended: Deploy to Render

Render is a cloud platform that offers a free tier for web services.

1.  **Push your code to GitHub**.
    -   Make sure this project is in a GitHub repository.
2.  **Sign up/Login to [Render](https://render.com)**.
3.  **Create a New Web Service**.
    -   Click "New +" -> "Web Service".
    -   Connect your GitHub repository.
4.  **Configure the Service**:
    -   **Name**: `spare-parts-app` (or any name)
    -   **Runtime**: `Node`
    -   **Build Command**: `npm install && npm run build`
        -   *Render runs `npm install` automatically.*
        -   *Our `postinstall` script in `package.json` will automatically install backend dependencies.*
    -   **Start Command**: `npm start`
5.  **Environment Variables**:
    -   Add the following environment variables in the "Environment" tab:
        -   `MONGO_URI`: Your MongoDB connection string (e.g., from MongoDB Atlas). If omitted, it uses an in-memory mock DB (data lost on restart).
        -   `OPENAI_API_KEY`: Your OpenAI API Key for image embeddings. If omitted, it uses mock embeddings.

## Alternative: Deploy to Railway

1.  Sign up at [Railway.app](https://railway.app).
2.  Click "New Project" -> "Deploy from GitHub repo".
3.  Select your repository.
4.  Railway should auto-detect the Node.js app and use `npm start`.
5.  Set variables in the "Variables" tab.

## Local Production Test

You can test the production build locally:

```bash
npm run build
npm start
```

Open `http://localhost:5000` to see the app.
