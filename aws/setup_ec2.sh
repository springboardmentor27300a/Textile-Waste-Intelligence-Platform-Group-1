#!/bin/bash
# ==============================================================================
# Textile Waste Intelligence Platform — AWS EC2 One-Click Provisioning Script
# Supported OS: Ubuntu 22.04 LTS / Debian 12 / Amazon Linux 2023
# ==============================================================================

set -e

echo "========================================================"
echo "🚀 Initializing AWS EC2 Server Environment Setup"
echo "========================================================"

# 1. Update and install essential tools
echo "📦 Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl git ufw htop ca-certificates gnupg lsb-release

# 2. Install Docker Engine
echo "🐳 Installing Docker Engine..."
if ! command -v docker &> /dev/null; then
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker $USER
fi

# 3. Verify Docker Compose
echo "🛠️ Verifying Docker Compose..."
docker compose version

# 4. Configure Firewall (UFW)
echo "🔒 Configuring UFW Firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "========================================================"
echo "✅ EC2 Environment Provisioning Complete!"
echo "➡️ Run './aws/deploy_aws.sh' to build and launch the platform."
echo "========================================================"
