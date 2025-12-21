#!/bin/bash

# Quick deployment script for Cloud Run
# Usage: ./deploy-cloud-run.sh YOUR_PROJECT_ID YOUR_GEMINI_API_KEY

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./deploy-cloud-run.sh PROJECT_ID GEMINI_API_KEY"
    exit 1
fi

PROJECT_ID=$1
GEMINI_API_KEY=$2
SERVICE_NAME="neural-consensus-engine"
REGION="us-central1"

echo "🚀 Deploying Neural Consensus Engine to Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "📦 Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Deploy to Cloud Run
echo "🔨 Building and deploying..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_API_KEY=$GEMINI_API_KEY,GEMINI_API_KEY_PRIMARY=$GEMINI_API_KEY" \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 1 \
  --min-instances 0

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your application is available at: $SERVICE_URL"
echo ""
echo "💡 Next steps:"
echo "   1. Visit $SERVICE_URL to test your application"
echo "   2. Set up budget alerts in GCP Console"
echo "   3. Monitor costs at https://console.cloud.google.com/billing"
