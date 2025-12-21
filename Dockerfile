# Multi-stage build for optimal image size

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

# Copy models.json if it exists
COPY models.json ./models.json 2>/dev/null || true

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Set environment variable for port
ENV PORT=8080

# Run the application
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}
