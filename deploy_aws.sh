#!/bin/bash
# ====================================================================
# TWIP (Textile Waste Intelligence Platform) - AWS EC2 Deploy Script
# ====================================================================

echo "========================================================"
echo "   TWIP - AWS EC2 One-Click Docker Deployment"
echo "========================================================"

# Step 1: Update System Packages
echo "[1/4] Updating package index..."
sudo apt-get update -y && sudo apt-get upgrade -y

# Step 2: Install Docker & Docker Compose
echo "[2/4] Installing Docker & Docker Compose..."
sudo apt-get install -y docker.io docker-compose git curl

# Step 3: Enable and Start Docker Service
echo "[3/4] Starting Docker service..."
sudo systemctl enable --now docker
sudo usermod -aG docker $USER

# Step 4: Build and Launch TWIP Containers
echo "[4/4] Building and launching TWIP Containers..."
sudo docker-compose up --build -d

echo ""
echo "========================================================"
echo "  🎉 TWIP IS NOW LIVE ON AWS!"
echo ""
echo "  Access Website at:  http://$(curl -s ifconfig.me):3000"
echo "  Access Backend API: http://$(curl -s ifconfig.me):8000"
echo "  Access Swagger Docs:http://$(curl -s ifconfig.me):8000/docs"
echo "========================================================"
