# Deploying Strikepoint Bot on Render.com

This guide will help you deploy your Discord bot to Render.com for **free** using their Web Service tier.

## Prerequisites
1.  A [GitHub](https://github.com/) account.
2.  A [Render](https://render.com/) account.
3.  Your code pushed to a GitHub repository.

## Step-by-Step Deployment

### 1. Push to GitHub
Ensure your latest code is pushed to your GitHub repository.
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Create a New Web Service on Render
1.  Log in to your [Render Dashboard](https://dashboard.render.com/).
2.  Click on **New +** and select **Web Service**.
3.  Connect your GitHub account if you haven't already.
4.  Select the repository containing your `strikepoint-bot` code.
5.  Render will automatically detect the `render.yaml` file configurations, but ensure the following are correct:
    - **Name**: `strikepoint-bot` (or your preferred name)
    - **Environment**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node src/index.js`
6.  **Instance Type**: Select **Free**.

### 3. Configure Environment Variables
You will need to add the following environment variables during setup or in the "Environment" tab after creation:
-   **DISCORD_TOKEN**: Your Discord Bot Token (from the Developer Portal).
-   **CLIENT_ID**: Your Bot's Application ID.
-   **GUILD_ID**: (Optional) The ID of your test server if you are using guild-specific commands.

### 4. Deploy
1.  Click **Create Web Service**.
2.  Render will start building your bot.
3.  Your bot will also start a small web server to satisfy Render's port binding requirement.
4.  **Important**: Free Web Services on Render will spin down after 15 minutes of inactivity. To keep your bot running 24/7, you should use a free uptime monitor (like [UptimeRobot](https://uptimerobot.com/)) to send a ping to your Render service's URL every 5-10 minutes.

## Troubleshooting
-   **Logs**: You can view the bot's console output in the **Logs** tab of your service on Render.
-   **Port Binding**: If the deployment fails due to "Port not bound", ensure `src/index.js` is correctly listening on `process.env.PORT`.

