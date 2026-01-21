# Deploying Strikepoint Bot on Render.com

This guide will help you deploy your Discord bot to Render.com for free (or paid if you need more resources).

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

### 2. Create a New Blueprint on Render
1.  Log in to your [Render Dashboard](https://dashboard.render.com/).
2.  Click on **New +** and select **Blueprint**.
3.  Connect your GitHub account if you haven't already.
4.  Select the repository containing your `strikepoint-bot` code.
5.  Render will automatically detect the `render.yaml` file.

### 3. Configure Environment Variables
Render will ask you to provide values for the environment variables defined in `render.yaml`.
-   **DISCORD_TOKEN**: Your Discord Bot Token (from the Developer Portal).
-   **CLIENT_ID**: Your Bot's Application ID.
-   **GUILD_ID**: (Optional) The ID of your test server if you are using guild-specific commands.

### 4. Deploy
1.  Click **Apply**.
2.  Render will start building your bot.
3.  Once the build finishes, your bot will start automatically.

## Troubleshooting
-   **Logs**: You can view the bot's console output in the **Logs** tab of your service on Render.
-   **Build Failures**: Ensure `npm install` runs successfully locally.
