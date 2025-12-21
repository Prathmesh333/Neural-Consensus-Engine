# 🚀 Quick Start: Deploy to GCP in 10 Minutes

This is a streamlined deployment guide with direct links and copy-paste commands.

---

## 📋 Prerequisites Checklist

- [ ] GCP account with $5 credit: [Create GCP Account](https://console.cloud.google.com/freetrial)
- [ ] Google Gemini API key: [Get API Key](https://aistudio.google.com/app/apikey)
- [ ] gcloud CLI installed: [Download](https://cloud.google.com/sdk/docs/install)
- [ ] Docker installed: [Download](https://www.docker.com/products/docker-desktop)

---

## 🔗 Important Links

| Resource | Link |
|----------|------|
| **GCP Console** | https://console.cloud.google.com |
| **Google AI Studio (API Keys)** | https://aistudio.google.com/app/apikey |
| **gcloud CLI Download** | https://cloud.google.com/sdk/docs/install |
| **Cloud Run Console** | https://console.cloud.google.com/run |
| **Billing Dashboard** | https://console.cloud.google.com/billing |
| **API Pricing** | https://ai.google.dev/pricing |

---

## ⚡ Method 1: One-Command Deployment (Recommended)

### Step 1: Install gcloud CLI

**Windows:**
```powershell
# Download and run installer
Invoke-WebRequest -Uri "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe" -OutFile "$env:TEMP\GoogleCloudSDKInstaller.exe"
& "$env:TEMP\GoogleCloudSDKInstaller.exe"
```

**After installation, restart PowerShell and verify:**
```powershell
gcloud --version
```

### Step 2: Login and Setup

```powershell
# Login to Google Cloud
gcloud auth login

# List your projects (or create a new one)
gcloud projects list

# If you need to create a project:
gcloud projects create neural-consensus-123 --name="Neural Consensus Engine"

# Set your project (replace with your project ID)
gcloud config set project YOUR_PROJECT_ID

# Link billing account (required)
# Visit: https://console.cloud.google.com/billing/linkedaccount
# Link your $5 credit to the project
```

### Step 3: Get Your Gemini API Key

1. Visit: https://aistudio.google.com/app/apikey
2. Click **"Create API Key"**
3. Copy the key (starts with `AIza...`)

### Step 4: Deploy with One Command

```powershell
# Navigate to your project directory
cd d:\Hackathon\Google-Agentathon\Neural_Consensus_Engine

# Run the deployment script
.\deploy-cloud-run.ps1 -ProjectId "YOUR_PROJECT_ID" -GeminiApiKey "YOUR_GEMINI_API_KEY"
```

**Example:**
```powershell
.\deploy-cloud-run.ps1 -ProjectId "neural-consensus-123" -GeminiApiKey "AIzaSyD..."
```

### Step 5: Access Your App

After deployment completes (5-10 minutes), you'll see:
```
✅ Deployment complete!
🌐 Your application is available at: https://neural-consensus-engine-xxxxx.run.app
```

Click the URL to access your deployed application! 🎉

---

## 🔧 Method 2: Manual Step-by-Step Deployment

If the script doesn't work, follow these manual steps:

### Step 1: Enable Required APIs

```powershell
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com
```

### Step 2: Build Frontend

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build production bundle
npm run build

# Go back to root
cd ..
```

### Step 3: Deploy to Cloud Run

```powershell
# Deploy (replace YOUR_API_KEY with your actual key)
gcloud run deploy neural-consensus-engine `
  --source . `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars="GOOGLE_API_KEY=YOUR_API_KEY,GEMINI_API_KEY_PRIMARY=YOUR_API_KEY" `
  --memory 512Mi `
  --cpu 1 `
  --timeout 300 `
  --max-instances 1 `
  --min-instances 0
```

### Step 4: Get Your URL

```powershell
gcloud run services describe neural-consensus-engine --region us-central1 --format 'value(status.url)'
```

---

## 📊 Set Up Budget Alerts (IMPORTANT!)

### Via Web Console (Easiest):

1. Visit: https://console.cloud.google.com/billing/budgets
2. Click **"CREATE BUDGET"**
3. Set amount: **$5.00**
4. Add thresholds: **50%, 80%, 100%**
5. Set email notifications to your email
6. Click **"FINISH"**

### Via Command Line:

```powershell
# First, get your billing account ID
gcloud billing accounts list

# Create budget (replace BILLING_ACCOUNT_ID)
gcloud billing budgets create `
  --billing-account=BILLING_ACCOUNT_ID `
  --display-name="$5 Budget Alert" `
  --budget-amount=5.00USD `
  --threshold-rule=percent=50 `
  --threshold-rule=percent=80 `
  --threshold-rule=percent=100
```

---

## 🎯 Verify Deployment

### Test the Backend API:

```powershell
# Replace with your Cloud Run URL
$URL = "https://neural-consensus-engine-xxxxx.run.app"

# Test status endpoint
Invoke-RestMethod -Uri "$URL/status"
```

Expected response:
```json
{
  "status": "operational",
  "service": "Neural Consensus Engine"
}
```

### Test the Frontend:

Open your Cloud Run URL in a browser and verify:
- [ ] Page loads correctly
- [ ] You can see the Neural Consensus Engine UI
- [ ] You can enter a query
- [ ] Click "Run Neural Consensus" generates results

---

## 💰 Cost Monitoring

### Check Your Spending:

1. **Billing Dashboard**: https://console.cloud.google.com/billing
2. **Cloud Run Metrics**: https://console.cloud.google.com/run
3. Click on your service → **"METRICS"** tab

### Expected Costs:

| Usage Pattern | Estimated Cost/Month | How Long $5 Lasts |
|---------------|----------------------|-------------------|
| Testing (10-20 requests/day) | $0.50 - $1.00 | 5+ months |
| Light Demo (50-100 requests/day) | $1.00 - $2.00 | 2-3 months |
| Active Development | $2.00 - $4.00 | 1-2 months |

> **Note**: Gemini API costs are separate! Monitor at: https://console.cloud.google.com/apis/dashboard

---

## 🛠️ Common Issues & Fixes

### Issue 1: "Permission Denied"

```powershell
# Add required roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID `
  --member="user:YOUR_EMAIL@gmail.com" `
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID `
  --member="user:YOUR_EMAIL@gmail.com" `
  --role="roles/iam.serviceAccountUser"
```

### Issue 2: "Billing Not Enabled"

1. Visit: https://console.cloud.google.com/billing/linkedaccount
2. Select your project
3. Link your billing account with $5 credit
4. Wait 2-3 minutes and retry deployment

### Issue 3: "Build Failed"

```powershell
# Check build logs
gcloud builds list --limit=1

# View specific build (replace BUILD_ID)
gcloud builds log BUILD_ID
```

### Issue 4: Frontend Shows 404

The frontend might not be built. Two solutions:

**Solution A**: Use the production backend
```powershell
# Copy production backend over development one
copy backend\main_production.py backend\main.py
# Re-deploy
.\deploy-cloud-run.ps1 -ProjectId "YOUR_PROJECT_ID" -GeminiApiKey "YOUR_API_KEY"
```

**Solution B**: Ensure frontend is built before deploying
```powershell
cd frontend
npm install
npm run build
cd ..
# Deploy again
```

---

## 🔄 Update Your Deployment

When you make changes:

```powershell
# Rebuild frontend
cd frontend
npm run build
cd ..

# Redeploy (reuses same configuration)
gcloud run deploy neural-consensus-engine --source . --region us-central1
```

---

## 🗑️ Delete Everything (Clean Up)

To avoid charges after you're done:

```powershell
# Delete Cloud Run service
gcloud run services delete neural-consensus-engine --region us-central1

# Delete the entire project (if you want)
gcloud projects delete YOUR_PROJECT_ID
```

---

## 📞 Need More Help?

- **Full Documentation**: See [GCP_DEPLOYMENT_GUIDE.md](./GCP_DEPLOYMENT_GUIDE.md)
- **GCP Support**: https://cloud.google.com/support
- **Community**: https://stackoverflow.com/questions/tagged/google-cloud-platform

---

## ✅ Deployment Checklist

Use this to track your progress:

- [ ] Installed gcloud CLI
- [ ] Logged in: `gcloud auth login`
- [ ] Created/selected GCP project
- [ ] Linked billing account with $5 credit
- [ ] Got Gemini API key from Google AI Studio
- [ ] Ran deployment command
- [ ] Received Cloud Run URL
- [ ] Tested application in browser
- [ ] Set up budget alerts
- [ ] Bookmarked billing dashboard

---

**🎉 Congratulations! Your Neural Consensus Engine is now live on GCP!**

Your app URL: `https://neural-consensus-engine-xxxxx.run.app` (replace with your actual URL)

Remember to monitor your costs at: https://console.cloud.google.com/billing
