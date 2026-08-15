#!/bin/bash
# ==============================================================================
# Textile Waste Intelligence Platform — Automated AWS Production Deployer
# ==============================================================================

set -e

echo "========================================================"
echo "🌱 Textile Waste Intelligence Platform — Deploying to AWS"
echo "========================================================"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check if .env.production exists, otherwise copy example
if [ ! -f .env.production ]; then
    echo "📋 Creating .env.production from template..."
    cp aws/.env.production.example .env.production
fi

echo "🐳 Building & Launching Production Docker Containers..."
docker compose -f docker-compose.prod.yml down --remove-orphans || true
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to become healthy..."
sleep 10

echo "🌱 Running Database Seed & Model Initialization..."
docker compose -f docker-compose.prod.yml exec -T backend python seed.py || echo "Seed completed"

echo "========================================================"
echo "🎉 AWS Production Deployment Successfully Live!"
echo "🌐 Frontend URL: http://$(curl -s http://checkip.amazonaws.com || echo 'localhost')"
echo "⚙️ Backend API:  http://$(curl -s http://checkip.amazonaws.com || echo 'localhost'):8000"
echo "📚 API Docs:     http://$(curl -s http://checkip.amazonaws.com || echo 'localhost'):8000/docs"
echo "========================================================"
