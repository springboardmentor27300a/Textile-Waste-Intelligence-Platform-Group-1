# AWS Cloud Services Deployment Guide
## Textile Waste Intelligence Platform — Production Architecture & Cloud Hosting

This document provides complete, production-grade instructions for deploying the **Textile Waste Intelligence Platform** on Amazon Web Services (AWS).

---

## 🏛️ System Architecture on AWS

```
                           [ Internet Users & Clients ]
                                        │
                                        ▼ (Port 80 / 443 HTTPS)
                   ┌─────────────────────────────────────────┐
                   │    AWS Route 53 (DNS) + AWS ACM (SSL)   │
                   └────────────────────┬────────────────────┘
                                        │
                                        ▼
                   ┌─────────────────────────────────────────┐
                   │   AWS Application Load Balancer (ALB)   │
                   └───────┬─────────────────────────┬───────┘
                           │                         │
            (Static Assets │                         │ (API Routes: /api/*)
             & SPA Routes) │                         │
                           ▼                         ▼
         ┌───────────────────────────┐    ┌───────────────────────────┐
         │  Frontend Container       │    │  FastAPI Backend Engine   │
         │  (Nginx Alpine + React)   │    │  (Python 3.11 + PyTorch)  │
         └───────────────────────────┘    └─────────────┬─────────────┘
                                                        │
                                ┌───────────────────────┴───────────────────────┐
                                │                                               │
                                ▼                                               ▼
                ┌──────────────────────────────┐                ┌──────────────────────────────┐
                │   AWS RDS PostgreSQL 15      │                │   AWS S3 (Blob Storage)      │
                │   (Multi-AZ Production DB)   │                │   (Image & Dataset Archives) │
                └──────────────────────────────┘                └──────────────────────────────┘
```

---

## 🚀 Deployment Options

We provide 4 AWS deployment pathways depending on infrastructure requirements:

### Option 1: AWS EC2 (Single-Instance / Production Server) — Recommended & Fastest
Best for immediate demonstration, hackathons, client reviews, or low-cost dedicated deployments.

#### 1. Launch EC2 Instance
- **AMI:** Ubuntu 22.04 LTS (64-bit x86_64) or Amazon Linux 2023
- **Instance Type:** `t3.medium` or `t3.large` (2 vCPU, 4–8 GB RAM recommended for ML inference)
- **Storage:** 20 GB gp3 SSD
- **Security Group Inbound Rules:**
  - `SSH (Port 22)`: Your IP
  - `HTTP (Port 80)`: `0.0.0.0/0`
  - `HTTPS (Port 443)`: `0.0.0.0/0`
  - `Backend API (Port 8000)`: `0.0.0.0/0` (Optional if proxied via Nginx)

#### 2. Connect & Clone Repository
```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
git clone <YOUR_GIT_REPO_URL> textile-waste-platform
cd textile-waste-platform
```

#### 3. Run Automated Provisioning & Deployment
```bash
# Make scripts executable
chmod +x aws/setup_ec2.sh aws/deploy_aws.sh

# Provision Docker & System Dependencies
./aws/setup_ec2.sh

# Deploy Production Multi-Container Stack (PostgreSQL + Backend + Frontend Nginx)
./aws/deploy_aws.sh
```

#### 4. Access Live Application
- **Frontend Dashboard:** `http://<EC2_PUBLIC_IP>`
- **Backend API:** `http://<EC2_PUBLIC_IP>:8000`
- **Swagger Documentation:** `http://<EC2_PUBLIC_IP>:8000/docs`

---

### Option 2: AWS ECS with Fargate + ECR (Fully Serverless Container Orchestration)

#### 1. Create ECR Repositories
```bash
aws ecr create-repository --repository-name textile-waste-backend --region <AWS_REGION>
aws ecr create-repository --repository-name textile-waste-frontend --region <AWS_REGION>
```

#### 2. Authenticate & Push Images
```bash
# Login to ECR
aws ecr get-login-password --region <AWS_REGION> | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com

# Build & Tag Backend
docker build -t textile-waste-backend ./backend
docker tag textile-waste-backend:latest <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/textile-waste-backend:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/textile-waste-backend:latest

# Build & Tag Frontend
docker build -t textile-waste-frontend ./frontend
docker tag textile-waste-frontend:latest <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/textile-waste-frontend:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/textile-waste-frontend:latest
```

#### 3. Register ECS Task Definition
```bash
aws ecs register-task-definition --cli-input-json file://aws/ecs-task-definition.json
```

#### 4. Create ECS Service
```bash
aws ecs create-service \
    --cluster textile-cluster \
    --service-name textile-service \
    --task-definition textile-waste-platform-task \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[<SUBNET_ID>],securityGroups=[<SG_ID>],assignPublicIp=ENABLED}"
```

---

### Option 3: AWS App Runner (PaaS Managed Container Service)

1. Open **AWS App Runner Console** -> **Create Service**.
2. Select **Container Image** (from ECR) or **Source Code Repository**.
3. Point to `backend` for the API service with port `8000`.
4. Deploy frontend static build (`dist/`) directly to **AWS S3 + CloudFront** or as a linked App Runner container.

---

### Option 4: AWS Elastic Beanstalk (Multi-Container Docker)

1. Package `aws/Dockerrun.aws.json` into a deployment zip:
```bash
zip -r textile-beanstalk.zip aws/Dockerrun.aws.json
```
2. In the AWS Elastic Beanstalk Console, create an application with **Platform: Multi-container Docker**.
3. Upload `textile-beanstalk.zip` and deploy.

---

## 🗄️ AWS RDS PostgreSQL Configuration

To link AWS RDS PostgreSQL with the platform:
1. Create an **Amazon RDS PostgreSQL** instance (`db.t3.micro` or `db.t4g.micro`).
2. Note your DB host (e.g. `textile-db.c123456789.us-east-1.rds.amazonaws.com`).
3. Set in your `.env.production`:
```env
DATABASE_URL=postgresql://dbuser:yourpassword@textile-db.c123456789.us-east-1.rds.amazonaws.com:5432/textile_waste_db
```

---

## 🔒 SSL / HTTPS Setup with Let's Encrypt (Certbot on EC2)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Certbot will automatically provision and install SSL certificates with auto-renewal.

---

## 📊 Post-Deployment Smoke Verification

Run the automated validation check after deploying:
```bash
# Check Backend Health
curl -f http://localhost:8000/api/inventory/stats/summary

# Check Reports Export
curl -f http://localhost:8000/api/reports/pdf?report_type=all -o test_report.pdf
```
