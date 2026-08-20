# ☁️ TWIP - Complete AWS EC2 Deployment Guide

Follow these simple steps to host the **Textile Waste Intelligence Platform (TWIP)** live on **Amazon Web Services (AWS)** using Docker.

---

## 📋 Step-by-Step AWS Setup Guide

### Step 1: Launch an AWS EC2 Instance (Free Tier Eligible)
1. Log in to your [AWS Management Console](https://aws.amazon.com/console/).
2. Navigate to **EC2** and click **Launch Instance**.
3. Set Instance Details:
   - **Name**: `TWIP-Production-Server`
   - **OS Image (AMI)**: **Ubuntu Server 22.04 LTS** (Free tier eligible)
   - **Instance Type**: `t3.micro` or `t3.small`
   - **Key Pair**: Create or select an existing `.pem` key pair (e.g. `twip-key.pem`)
4. In **Network Settings (Security Group)**, allow the following inbound ports:
   | Protocol | Port Range | Source | Description |
   | :--- | :--- | :--- | :--- |
   | SSH | `22` | Anywhere (`0.0.0.0/0`) | Remote SSH terminal access |
   | HTTP | `80` | Anywhere (`0.0.0.0/0`) | Standard Web Traffic |
   | Custom TCP | `3000` | Anywhere (`0.0.0.0/0`) | Next.js Frontend |
   | Custom TCP | `8000` | Anywhere (`0.0.0.0/0`) | FastAPI Backend API |

5. Click **Launch Instance**.

---

### Step 2: Connect to your AWS EC2 Instance via SSH
Open your computer terminal or PowerShell and run:
```bash
chmod 400 twip-key.pem
ssh -i "twip-key.pem" ubuntu@<YOUR_AWS_PUBLIC_IP>
```
*(Replace `<YOUR_AWS_PUBLIC_IP>` with your EC2 Public IP address from AWS console).*

---

### Step 3: Copy Project Files to EC2 Server
From your local project directory, upload the files to your AWS server:
```bash
scp -i "twip-key.pem" -r . ubuntu@<YOUR_AWS_PUBLIC_IP>:/home/ubuntu/twip
```
*Alternatively, you can push the codebase to GitHub and run `git clone <your-repo-url>` on EC2.*

---

### Step 4: Run Deployment Script on AWS
Once connected inside your AWS EC2 terminal:
```bash
cd /home/ubuntu/twip
chmod +x deploy_aws.sh
./deploy_aws.sh
```

---

## 🎉 Verification & Live URLs

Once the script completes, your platform is **live 24/7 on AWS**:

- 🌐 **Frontend Website**: `http://<YOUR_AWS_PUBLIC_IP>:3000`
- ⚙️ **Backend API**: `http://<YOUR_AWS_PUBLIC_IP>:8000`
- 📄 **Interactive Swagger Docs**: `http://<YOUR_AWS_PUBLIC_IP>:8000/docs`

---

## 🛠️ Management Commands on AWS

- **View Live Logs**:
  ```bash
  sudo docker-compose logs -f
  ```
- **Stop Server**:
  ```bash
  sudo docker-compose down
  ```
- **Restart Server**:
  ```bash
  sudo docker-compose restart
  ```
