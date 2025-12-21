# Quick deployment script for Cloud Run (PowerShell)
# Usage: .\deploy-cloud-run.ps1 -ProjectId "YOUR_PROJECT_ID" -GeminiApiKey "YOUR_API_KEY"

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId,
    
    [Parameter(Mandatory=$true)]
    [string]$GeminiApiKey,
    
    [string]$ServiceName = "neural-consensus-engine",
    [string]$Region = "asia-south1"
)

Write-Host "🚀 Deploying Neural Consensus Engine to Cloud Run..." -ForegroundColor Cyan
Write-Host "Project: $ProjectId" -ForegroundColor White
Write-Host "Region: $Region" -ForegroundColor White
Write-Host ""

# Set project
Write-Host "📋 Setting project..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Enable required APIs
Write-Host "📦 Enabling required APIs..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Deploy to Cloud Run
Write-Host "🔨 Building and deploying..." -ForegroundColor Yellow
gcloud run deploy $ServiceName `
  --source . `
  --platform managed `
  --region $Region `
  --allow-unauthenticated `
  --set-env-vars="GOOGLE_API_KEY=$GeminiApiKey,GEMINI_API_KEY_PRIMARY=$GeminiApiKey" `
  --memory 512Mi `
  --cpu 1 `
  --timeout 300 `
  --max-instances 1 `
  --min-instances 0

# Get the service URL
$ServiceUrl = gcloud run services describe $ServiceName --region $Region --format 'value(status.url)'

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your application is available at: $ServiceUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Visit $ServiceUrl to test your application"
Write-Host "   2. Set up budget alerts in GCP Console"
Write-Host "   3. Monitor costs at https://console.cloud.google.com/billing"
