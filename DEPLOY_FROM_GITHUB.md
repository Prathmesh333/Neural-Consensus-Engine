# 🚀 Deploy from GitHub to GCP (Easiest Method!)

Deploy your Neural Consensus Engine directly from GitHub to Google Cloud Run - **no Docker, no local builds required!**

---

## 📋 Prerequisites

- [ ] GCP account with $5 credit: [Sign up](https://console.cloud.google.com/freetrial)
- [ ] Your code on GitHub (public or private repo)
- [ ] Gemini API key: [Get it here](https://aistudio.google.com/app/apikey)

---

## 🎯 Method 1: Deploy via Web Console (No Command Line!)

### Step 1: Go to Cloud Run

1. Visit: **https://console.cloud.google.com/run**
2. Click **"CREATE SERVICE"**

### Step 2: Configure Source

1. Select **"Continuously deploy from a repository (source-based)"**
2. Click **"SET UP WITH CLOUD BUILD"**
3. Choose **"GitHub"** as source repository
4. Click **"Authenticate"** and connect your GitHub account
5. Select your repository: `Prathmesh333/NCE_Simple` (or your fork)
6. Select branch: **`main`** (or your branch name)
7. Click **"NEXT"**

### Step 3: Build Configuration

1. Build type: Select **"Dockerfile"**
2. Source location: **`/Dockerfile`** (it will auto-detect)
3. Click **"SAVE"**

### Step 4: Service Configuration

1. **Service name**: `neural-consensus-engine`
2. **Region**: `us-central1` (lowest cost)
3. **Authentication**: Select **"Allow unauthenticated invocations"**
4. Click **"SHOW ADVANCED SETTINGS"**

**Container settings:**
- Memory: **512 MiB**
- CPU: **1**
- Request timeout: **300 seconds**

**Autoscaling:**
- Minimum instances: **0**
- Maximum instances: **1**

**Environment Variables:**
Click **"+ ADD VARIABLE"** and add:
```
GOOGLE_API_KEY = your_gemini_api_key_here
GEMINI_API_KEY_PRIMARY = your_gemini_api_key_here
```

### Step 5: Deploy!

1. Click **"CREATE"**
2. Wait 5-10 minutes for the build and deployment
3. Once done, you'll see a green checkmark ✅
4. Click on the service URL to access your app!

---

## ⚡ Method 2: Deploy via Command Line from GitHub

Even easier - just one command!

### Step 1: Install gcloud CLI (if not already)

**Windows:**
```powershell
Invoke-WebRequest -Uri "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe" -OutFile "$env:TEMP\GoogleCloudSDKInstaller.exe"
& "$env:TEMP\GoogleCloudSDKInstaller.exe"
```

Restart PowerShell, then:
```powershell
gcloud --version
gcloud auth login
```

### Step 2: Enable APIs

```powershell
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Step 3: Deploy Directly from GitHub

```powershell
gcloud run deploy neural-consensus-engine `
  --source https://github.com/Prathmesh333/NCE_Simple `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars="GOOGLE_API_KEY=YOUR_GEMINI_API_KEY,GEMINI_API_KEY_PRIMARY=YOUR_GEMINI_API_KEY" `
  --memory 512Mi `
  --cpu 1 `
  --timeout 300 `
  --max-instances 1 `
  --min-instances 0
```

**That's it!** Your app will be deployed directly from GitHub.

---

## 🔄 Automatic Updates (CI/CD)

Want your GCP deployment to auto-update when you push to GitHub?

### Set Up Continuous Deployment:

1. Go to **https://console.cloud.google.com/run**
2. Click on your service: `neural-consensus-engine`
3. Click **"SET UP CONTINUOUS DEPLOYMENT"**
4. Connect your GitHub repository
5. Choose branch to deploy from (e.g., `main`)
6. Click **"SAVE"**

Now, every time you push to GitHub, GCP will automatically rebuild and deploy! 🎉

---

## 📝 What You Need in Your GitHub Repo

Make sure your repository has these files:

```
Neural_Consensus_Engine/
├── Dockerfile                  ✅ (Already created)
├── .gcloudignore              ✅ (Already created)
├── backend/
│   ├── requirements.txt       ✅
│   ├── main.py               ✅
│   └── ...
├── frontend/
│   ├── package.json          ✅
│   └── ...
└── models.json               ✅
```

**Good news**: All these files are already in your repo! You're ready to deploy.

---

## 🎯 Quick Comparison

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **GitHub Web Console** | No coding, visual interface | Slower initial setup | Beginners |
| **GitHub Command Line** | One command, fast | Need gcloud CLI | Developers |
| **Local Deployment** | Test locally first | Need Docker, bigger download | Testing changes |

---

## 💡 Pro Tips

1. **Use GitHub releases**: Tag versions for production deployments
2. **Environment files**: Never commit `.env` files to GitHub (they're in `.gitignore`)
3. **Free builds**: Cloud Build has 120 build-minutes/day free tier
4. **Auto-scaling**: With min instances = 0, you pay nothing when idle

---

## 🛠️ Troubleshooting

### Issue: "Repository not found"

Make sure your GitHub repo is:
- Public, OR
- You've authorized Cloud Build to access private repos

### Issue: "Build failed - frontend not building"

Add a build step to frontend. Update your `Dockerfile`:
```dockerfile
# Frontend build stage is already in your Dockerfile ✅
```

### Issue: "API key not working"

1. Get fresh API key: https://aistudio.google.com/app/apikey
2. Update environment variables in Cloud Run console
3. Go to: https://console.cloud.google.com/run → Click service → **EDIT & DEPLOY NEW REVISION** → Update variables

---

## 📊 Monitor Your Deployment

- **Service Status**: https://console.cloud.google.com/run
- **Build History**: https://console.cloud.google.com/cloud-build/builds
- **Logs**: https://console.cloud.google.com/logs
- **Costs**: https://console.cloud.google.com/billing

---

## ✅ Deployment Checklist

- [ ] Created GCP account with $5 credit
- [ ] Got Gemini API key from Google AI Studio
- [ ] Pushed code to GitHub (it's already there!)
- [ ] Visited Cloud Run console
- [ ] Connected GitHub repository
- [ ] Set environment variables
- [ ] Clicked "CREATE"
- [ ] Got deployment URL
- [ ] Tested the app
- [ ] Set up budget alerts

---

## 🎉 You're Done!

Your app is now live at: `https://neural-consensus-engine-xxxxx.run.app`

**Next steps:**
1. Set up budget alerts: https://console.cloud.google.com/billing/budgets
2. (Optional) Set up continuous deployment for auto-updates
3. Share your app URL with others!

**Estimated cost**: $0.50 - $2.00/month with light usage → Your $5 will last 2-5 months! 💰
