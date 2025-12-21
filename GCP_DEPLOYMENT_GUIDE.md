# GCP Deployment Guide for Neural Consensus Engine

This guide will help you deploy the Neural Consensus Engine to Google Cloud Platform (GCP) with optimal cost management for your $5 credit.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Cost Optimization Strategy](#cost-optimization-strategy)
- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
- [Option 1: Cloud Run (Recommended)](#option-1-cloud-run-recommended)
- [Option 2: App Engine](#option-2-app-engine)
- [Option 3: Compute Engine (Most Flexible)](#option-3-compute-engine-most-flexible)
- [Post-Deployment Steps](#post-deployment-steps)
- [Cost Management & Monitoring](#cost-management--monitoring)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

Your Neural Consensus Engine consists of:

- **Backend**: Python FastAPI application (Port 8000)
  - Uses LangGraph for orchestration
  - Integrates with Google Gemini AI API
  - Dependencies: fastapi, uvicorn, langgraph, google-generativeai
  
- **Frontend**: React + Vite application (Port 5173)
  - Interactive UI with graph visualization
  - Communicates with backend via REST API

---

## 💰 Cost Optimization Strategy

With a $5 GCP credit, we need to be strategic:

> [!IMPORTANT]
> **Best Option: Cloud Run** - Pay only for actual usage, automatic scaling to zero when idle. Most cost-effective for development/demo applications.

### Estimated Costs (Per Month)

| Service | Free Tier | Estimated Cost |
|---------|-----------|----------------|
| **Cloud Run** (Recommended) | 2M requests, 360,000 GB-seconds | ~$0.50-$2.00 for light usage |
| **Cloud Storage** (for static assets) | 5GB storage, 5,000 Class A operations | Free for your use case |
| **Cloud Build** | 120 build-minutes/day | Free for deployment |
| **Gemini API** | See [Google AI Pricing](https://ai.google.dev/pricing) | Variable based on usage |

> [!WARNING]
> The Gemini API is charged separately from GCP infrastructure. Monitor your API usage carefully as this will be your primary cost driver.

---

## ✅ Prerequisites

Before deploying, ensure you have:

1. **Google Cloud Account** with $5 credit activated
2. **Google Gemini API Key(s)** from [Google AI Studio](https://aistudio.google.com/)
3. **gcloud CLI** installed ([Installation Guide](https://cloud.google.com/sdk/docs/install))
4. **Docker** installed (for containerization)
5. **Git** (to clone/manage your code)

### Install gcloud CLI

```bash
# Windows (PowerShell as Administrator)
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe

# Verify installation
gcloud --version
```

### Initialize gcloud

```bash
# Login to your Google account
gcloud auth login

# Set your project (replace PROJECT_ID with your actual project ID)
gcloud config set project PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable storage.googleapis.com
```

---

## 🚀 Deployment Options

### Option 1: Cloud Run (Recommended)

**Best for**: Development, demos, low-traffic applications  
**Cost**: ~$0.50-$2.00/month for light usage  
**Pros**: Auto-scaling to zero, pay-per-use, easy deployment  
**Cons**: Cold starts (2-5 seconds when idle)

#### Step 1: Prepare Your Application

Create a `Dockerfile` in your project root:

```dockerfile
# Multi-stage build for smaller images

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend + Frontend Static Files
FROM python:3.11-slim
WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 8080

# Update backend to serve static files and run on port 8080
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

#### Step 2: Update Backend to Serve Frontend

Modify [`backend/main.py`](file:///d:/Hackathon/Google-Agentathon/Neural_Consensus_Engine/backend/main.py) to serve the frontend:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv()

app = FastAPI(title="Neural Consensus Engine API")

# CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve frontend static files
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")
    
    @app.get("/")
    async def serve_frontend():
        return FileResponse(str(frontend_dist / "index.html"))

# ... rest of your existing code ...
```

#### Step 3: Create `.gcloudignore`

Create a `.gcloudignore` file in your project root to exclude unnecessary files:

```
.git
.gitignore
.venv
venv
__pycache__
*.pyc
node_modules
frontend/node_modules
*.log
.env
README.md
*.pdf
```

#### Step 4: Deploy to Cloud Run

```bash
# Set environment variables for Cloud Run
gcloud run deploy neural-consensus-engine \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_API_KEY=your_api_key_here,GEMINI_API_KEY_PRIMARY=your_api_key_here" \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 1 \
  --min-instances 0

# The --source flag will automatically build using Cloud Build
```

> [!TIP]
> Use `--min-instances 0` to scale to zero when idle, saving costs. The first request after idle will have a cold start (2-5 seconds).

#### Step 5: Configure Custom Domain (Optional)

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service neural-consensus-engine \
  --domain your-domain.com \
  --region us-central1
```

---

### Option 2: App Engine

**Best for**: Applications needing persistent instances  
**Cost**: ~$0.05/hour (~$36/month) for F1 instance - **Not recommended for $5 budget**

<details>
<summary>Click to expand App Engine instructions (Not recommended for $5 budget)</summary>

#### Step 1: Create `app.yaml`

```yaml
runtime: python311
entrypoint: uvicorn backend.main:app --host 0.0.0.0 --port $PORT

env_variables:
  GOOGLE_API_KEY: "your_api_key_here"
  GEMINI_API_KEY_PRIMARY: "your_api_key_here"

handlers:
  - url: /.*
    script: auto

automatic_scaling:
  min_instances: 0
  max_instances: 1
  target_cpu_utilization: 0.65
```

#### Step 2: Deploy

```bash
gcloud app deploy app.yaml
```

> [!CAUTION]
> App Engine Standard has a minimum cost even when idle. This will quickly consume your $5 credit.

</details>

---

### Option 3: Compute Engine (Most Flexible)

**Best for**: Full control, running 24/7 services  
**Cost**: ~$4.28/month for e2-micro in us-central1 with 10GB standard disk

#### Step 1: Create a VM Instance

```bash
# Create an e2-micro instance (free tier eligible for 1 instance)
gcloud compute instances create neural-consensus-vm \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=debian-11 \
  --image-project=debian-cloud \
  --boot-disk-size=10GB \
  --boot-disk-type=pd-standard \
  --tags=http-server,https-server

# Create firewall rules
gcloud compute firewall-rules create allow-http \
  --allow tcp:80 \
  --target-tags http-server

gcloud compute firewall-rules create allow-backend \
  --allow tcp:8000 \
  --target-tags http-server
```

> [!NOTE]
> GCP Free Tier includes 1 e2-micro instance per month in us-west1, us-central1, or us-east1. Choose one of these regions.

#### Step 2: SSH into VM and Setup

```bash
# SSH into the VM
gcloud compute ssh neural-consensus-vm --zone=us-central1-a

# Once inside the VM, run these commands:

# Update system
sudo apt-get update
sudo apt-get install -y python3-pip python3-venv git nginx

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your repository (or use gcloud compute scp to copy files)
git clone https://github.com/YOUR_USERNAME/Neural_Consensus_Engine.git
cd Neural_Consensus_Engine

# Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
GOOGLE_API_KEY=your_api_key_here
GEMINI_API_KEY_PRIMARY=your_api_key_here
GEMINI_API_KEY_SECONDARY=your_api_key_here
GEMINI_API_KEY_TERTIARY=your_api_key_here
EOF

# Setup frontend
cd ../frontend
npm install
npm run build

# Create systemd service for backend
sudo tee /etc/systemd/system/neural-backend.service > /dev/null << EOF
[Unit]
Description=Neural Consensus Engine Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/home/$USER/Neural_Consensus_Engine
Environment="PATH=/home/$USER/Neural_Consensus_Engine/backend/venv/bin"
ExecStart=/home/$USER/Neural_Consensus_Engine/backend/venv/bin/python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Start backend service
sudo systemctl daemon-reload
sudo systemctl enable neural-backend
sudo systemctl start neural-backend

# Configure nginx to serve frontend and proxy backend
sudo tee /etc/nginx/sites-available/neural-consensus > /dev/null << EOF
server {
    listen 80;
    server_name _;

    # Serve frontend
    location / {
        root /home/$USER/Neural_Consensus_Engine/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Direct backend endpoints
    location ~ ^/(generate|status) {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable nginx site
sudo ln -sf /etc/nginx/sites-available/neural-consensus /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 3: Access Your Application

```bash
# Get external IP
gcloud compute instances describe neural-consensus-vm \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# Visit http://YOUR_EXTERNAL_IP in your browser
```

#### Step 4: Update Frontend API URL

Update your frontend to use the backend proxy:

In your frontend code, update the API base URL from `http://localhost:8000` to `/` (relative path) or `http://YOUR_EXTERNAL_IP`.

---

## 📝 Post-Deployment Steps

### 1. Update Frontend API Configuration

If using Cloud Run or external URL, update your frontend's API endpoint:

**In your frontend code** (typically in a config file or API service):

```javascript
// Before (local development)
const API_BASE_URL = 'http://localhost:8000';

// After (production - Cloud Run)
const API_BASE_URL = process.env.VITE_API_URL || 'https://your-cloud-run-url.run.app';

// After (production - Compute Engine with nginx proxy)
const API_BASE_URL = '/';  // Nginx will proxy to backend
```

### 2. Set Up Environment Variables Securely

For **Cloud Run**, use Secret Manager:

```bash
# Create a secret
echo -n "your_api_key_here" | gcloud secrets create gemini-api-key --data-file=-

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Update Cloud Run to use secret
gcloud run services update neural-consensus-engine \
  --update-secrets=GOOGLE_API_KEY=gemini-api-key:latest \
  --region=us-central1
```

For **Compute Engine**, use the `.env` file (as shown in Option 3).

### 3. Enable HTTPS (Recommended)

**Cloud Run**: HTTPS is enabled by default with auto-managed certificates.

**Compute Engine**: Use Let's Encrypt:

```bash
# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured by default
```

---

## 📊 Cost Management & Monitoring

### Set Up Budget Alerts

```bash
# Create budget alert at $4 (80% of $5)
gcloud billing budgets create \
  --billing-account=YOUR_BILLING_ACCOUNT_ID \
  --display-name="Neural Consensus Engine Budget" \
  --budget-amount=5 \
  --threshold-rule=percent=80 \
  --threshold-rule=percent=100
```

### Monitor Costs

1. **GCP Console**: Visit [Billing Dashboard](https://console.cloud.google.com/billing)
2. **Cost Breakdown**: Check costs by service
3. **Set Alerts**: Create budget alerts at 50%, 80%, and 100%

### Cost-Saving Tips

> [!TIP]
> **Minimize Costs with These Strategies:**
> 
> 1. **Use Cloud Run with min-instances=0**: Scales to zero when idle
> 2. **Limit Gemini API calls**: Cache responses when possible
> 3. **Use e2-micro for Compute Engine**: Free tier eligible
> 4. **Delete unused resources**: Stop VMs when not in use
> 5. **Monitor daily**: Check billing dashboard regularly
> 6. **Use Cloud Scheduler**: Stop VMs during off-hours

```bash
# Stop a VM to save costs
gcloud compute instances stop neural-consensus-vm --zone=us-central1-a

# Start it again when needed
gcloud compute instances start neural-consensus-vm --zone=us-central1-a
```

### Estimated Monthly Costs

| Scenario | Service | Cost |
|----------|---------|------|
| **Light Demo Usage** | Cloud Run (0-100 requests/day) | $0.50 - $1.00 |
| **Development** | e2-micro VM (8 hours/day) | $1.00 - $1.50 |
| **24/7 Development** | e2-micro VM (always on) | $4.28 |
| **Gemini API** | ~1000 requests (flash model) | ~$0.10 - $0.50 |

> [!WARNING]
> **Your $5 credit will last:**
> - **Cloud Run**: 2-5 months with light usage
> - **e2-micro VM 24/7**: Just over 1 month
> - **Mix of both**: Depends on usage patterns

---

## 🔧 Troubleshooting

### Common Issues

#### 1. **"Permission denied" errors**

```bash
# Ensure you have the necessary roles
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="user:YOUR_EMAIL" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="user:YOUR_EMAIL" \
  --role="roles/iam.serviceAccountUser"
```

#### 2. **Cloud Run deployment fails**

```bash
# Check logs
gcloud run services logs read neural-consensus-engine --region=us-central1

# Verify environment variables are set
gcloud run services describe neural-consensus-engine --region=us-central1
```

#### 3. **Frontend can't connect to backend**

- **Cloud Run**: Ensure CORS is configured correctly in `main.py`
- **Compute Engine**: Check firewall rules and nginx configuration
- **Both**: Verify API endpoint URL in frontend code

#### 4. **Out of memory errors**

```bash
# Increase Cloud Run memory
gcloud run services update neural-consensus-engine \
  --memory 1Gi \
  --region=us-central1

# Note: This will increase costs slightly
```

#### 5. **Cold start timeout**

```bash
# Increase timeout (max 3600s)
gcloud run services update neural-consensus-engine \
  --timeout 300 \
  --region=us-central1
```

### Debug Commands

```bash
# Check service status
gcloud run services describe neural-consensus-engine --region=us-central1

# View logs
gcloud run services logs read neural-consensus-engine --region=us-central1 --limit 50

# Test locally with Docker
docker build -t neural-consensus .
docker run -p 8080:8080 -e GOOGLE_API_KEY=your_key neural-consensus

# SSH into Compute Engine VM
gcloud compute ssh neural-consensus-vm --zone=us-central1-a

# Check backend service status (on VM)
sudo systemctl status neural-backend
sudo journalctl -u neural-backend -f  # Follow logs
```

---

## 🎯 Quick Start Checklist

- [ ] Install gcloud CLI and Docker
- [ ] Create GCP project and enable billing
- [ ] Enable required APIs (Cloud Run, Cloud Build)
- [ ] Get Gemini API keys from Google AI Studio
- [ ] Choose deployment option (Cloud Run recommended)
- [ ] Create Dockerfile and `.gcloudignore`
- [ ] Update `backend/main.py` to serve frontend
- [ ] Deploy using gcloud command
- [ ] Set environment variables/secrets
- [ ] Test deployed application
- [ ] Set up budget alerts
- [ ] Monitor costs daily

---

## 📚 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [GCP Free Tier](https://cloud.google.com/free)
- [Google Gemini API Pricing](https://ai.google.dev/pricing)
- [gcloud CLI Reference](https://cloud.google.com/sdk/gcloud/reference)
- [Docker Documentation](https://docs.docker.com/)

---

## 🆘 Need Help?

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review GCP logs: `gcloud run services logs read SERVICE_NAME`
3. Check your quotas: [GCP Quotas Page](https://console.cloud.google.com/iam-admin/quotas)
4. Verify billing is enabled and credit is available

---

**Good luck with your deployment! 🚀**

Remember to monitor your costs regularly to make the most of your $5 credit.
