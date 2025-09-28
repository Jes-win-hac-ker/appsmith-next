# GitHub Pages Deployment Guide

This guide will help you deploy your movie app to GitHub Pages using GitHub Actions.

## Prerequisites

1. **GitHub Repository**: Make sure your code is pushed to a GitHub repository
2. **TMDB API Key**: You'll need a valid TMDB API key for the movie data

## Setup Instructions

### 1. Configure Repository Secrets

Your TMDB API key needs to be stored as a GitHub repository secret to keep it secure:

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add the following secret:
   - **Name**: `VITE_TMDB_API_KEY`
   - **Value**: Your actual TMDB API key (get it from https://www.themoviedb.org/settings/api)

### 2. Enable GitHub Pages

1. In your repository, go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save the settings

### 3. Deploy Your App

The deployment will happen automatically when you:
- Push code to the `main` branch
- Or manually trigger it from the **Actions** tab

## Workflow Features

The `deploy.yml` workflow includes:

- ✅ **Automatic builds** on push to main branch
- ✅ **Manual deployment** option from Actions tab
- ✅ **Bun and npm support** (automatically detects which to use)
- ✅ **Optimized builds** with code splitting
- ✅ **Secure API key handling** via GitHub secrets
- ✅ **GitHub Pages integration** with proper base path configuration

## Accessing Your Deployed App

Once deployed, your app will be available at:
```
https://YOUR_USERNAME.github.io/appsmith-next/
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Troubleshooting

### Build Fails
- Check that all dependencies are listed in `package.json`
- Verify that your TMDB API key secret is properly set
- Review the Actions logs for specific error messages

### App Loads but API Calls Fail
- Ensure `VITE_TMDB_API_KEY` secret is set correctly
- Verify your TMDB API key is valid and active
- Check browser console for specific error messages

### Routing Issues
- The app uses client-side routing; GitHub Pages should handle this correctly
- If you encounter 404s on refresh, the base path configuration should resolve this

## Local Development vs Production

- **Local**: Uses `.env` file with `VITE_TMDB_API_KEY`
- **Production**: Uses GitHub repository secret `VITE_TMDB_API_KEY`
- **Base Path**: Automatically configured for GitHub Pages deployment

## Security Notes

- Never commit your `.env` file with real API keys
- Use GitHub secrets for production environment variables
- The workflow only deploys from the main branch for security

## Manual Deployment

To trigger a manual deployment:
1. Go to your repository's **Actions** tab
2. Click on **Deploy to GitHub Pages** workflow
3. Click **Run workflow**
4. Select the `main` branch and click **Run workflow**