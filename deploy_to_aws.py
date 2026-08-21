import boto3
import subprocess
import os
import json
import time
import mimetypes
from botocore.exceptions import ClientError

def run_command(cmd, cwd=None):
    print(f"Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True, cwd=cwd)

def setup_ecr_and_push_image():
    print("--- Setting up ECR and building Docker image ---")
    sts = boto3.client('sts')
    account_id = sts.get_caller_identity()['Account']
    region = boto3.session.Session().region_name
    
    ecr = boto3.client('ecr')
    repo_name = 'twip-backend'
    
    try:
        ecr.describe_repositories(repositoryNames=[repo_name])
        print(f"ECR Repository {repo_name} already exists.")
    except ecr.exceptions.RepositoryNotFoundException:
        ecr.create_repository(repositoryName=repo_name)
        print(f"Created ECR repository {repo_name}.")
    
    registry = f"{account_id}.dkr.ecr.{region}.amazonaws.com"
    
    # Get ECR login token
    auth_data = ecr.get_authorization_token()
    token = auth_data['authorizationData'][0]['authorizationToken']
    import base64
    password = base64.b64decode(token).decode('utf-8').split(':')[1]
    
    # Docker login
    run_command(f'docker login --username AWS --password {password} {registry}')
    
    # Docker build and push
    run_command('docker build -t twip-backend ./backend')
    run_command(f'docker tag twip-backend:latest {registry}/{repo_name}:latest')
    run_command(f'docker push {registry}/{repo_name}:latest')
    
    return f"{registry}/{repo_name}:latest"

def create_apprunner_role():
    print("--- Setting up App Runner IAM Role ---")
    iam = boto3.client('iam')
    role_name = 'AppRunnerECRAccessRole'
    
    assume_role_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {"Service": "build.apprunner.amazonaws.com"},
                "Action": "sts:AssumeRole"
            }
        ]
    }
    
    try:
        iam.get_role(RoleName=role_name)
        print(f"Role {role_name} already exists.")
    except iam.exceptions.NoSuchEntityException:
        iam.create_role(
            RoleName=role_name,
            AssumeRolePolicyDocument=json.dumps(assume_role_policy)
        )
        iam.attach_role_policy(
            RoleName=role_name,
            PolicyArn='arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess'
        )
        print(f"Created IAM role {role_name}. Waiting 10s for propagation...")
        time.sleep(10)
        
    return iam.get_role(RoleName=role_name)['Role']['Arn']

def deploy_app_runner(image_identifier, access_role_arn):
    print("--- Deploying AWS App Runner Service ---")
    apprunner = boto3.client('apprunner')
    service_name = 'twip-backend-service'
    
    try:
        services = apprunner.list_services()['ServiceSummaryList']
        existing = [s for s in services if s['ServiceName'] == service_name]
        
        if existing:
            service_arn = existing[0]['ServiceArn']
            print(f"Service {service_name} exists. Triggering update.")
            apprunner.start_deployment(ServiceArn=service_arn)
            service_url = existing[0]['ServiceUrl']
            return f"https://{service_url}"
            
        print(f"Creating new App Runner service {service_name}...")
        response = apprunner.create_service(
            ServiceName=service_name,
            SourceConfiguration={
                'ImageRepository': {
                    'ImageIdentifier': image_identifier,
                    'ImageConfiguration': {
                        'Port': '8000'
                    },
                    'ImageRepositoryType': 'ECR'
                },
                'AutoDeploymentsEnabled': False,
                'AuthenticationConfiguration': {
                    'AccessRoleArn': access_role_arn
                }
            },
            InstanceConfiguration={
                'Cpu': '1 vCPU',
                'Memory': '2 GB'
            }
        )
        service_url = response['Service']['ServiceUrl']
        print("Service creation initiated. This may take 5-10 minutes.")
        return f"https://{service_url}"
    except Exception as e:
        print(f"Error creating App Runner service: {e}")
        raise

def deploy_s3_frontend(backend_url):
    print("--- Deploying Frontend to S3 ---")
    sts = boto3.client('sts')
    s3 = boto3.client('s3')
    account_id = sts.get_caller_identity()['Account']
    region = boto3.session.Session().region_name
    
    bucket_name = f'twip-frontend-{account_id}-{region}'
    
    try:
        s3.head_bucket(Bucket=bucket_name)
        print(f"Bucket {bucket_name} already exists.")
    except ClientError:
        if region == 'us-east-1':
            s3.create_bucket(Bucket=bucket_name)
        else:
            s3.create_bucket(Bucket=bucket_name, CreateBucketConfiguration={'LocationConstraint': region})
        print(f"Created bucket {bucket_name}.")
        
        # Remove public access block
        s3.delete_public_access_block(Bucket=bucket_name)
        time.sleep(2)
        
        # Add bucket policy
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadGetObject",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": f"arn:aws:s3:::{bucket_name}/*"
                }
            ]
        }
        s3.put_bucket_policy(Bucket=bucket_name, Policy=json.dumps(policy))
        
        # Enable website hosting
        s3.put_bucket_website(
            Bucket=bucket_name,
            WebsiteConfiguration={
                'IndexDocument': {'Suffix': 'index.html'},
                'ErrorDocument': {'Key': 'index.html'}
            }
        )
    
    # Upload files
    frontend_dir = os.path.join(os.getcwd(), 'frontend')
    for root, dirs, files in os.walk(frontend_dir):
        for file in files:
            file_path = os.path.join(root, file)
            s3_key = os.path.relpath(file_path, frontend_dir).replace('\\', '/')
            content_type = mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
            
            # If we need to inject the backend URL into api.js
            if s3_key == 'js/api.js':
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                # Replace the API_BASE line
                import re
                content = re.sub(
                    r'const API_BASE = ".*";',
                    f'const API_BASE = "{backend_url}";',
                    content
                )
                s3.put_object(Bucket=bucket_name, Key=s3_key, Body=content.encode('utf-8'), ContentType=content_type)
            else:
                s3.upload_file(file_path, bucket_name, s3_key, ExtraArgs={'ContentType': content_type})
    
    website_url = f"http://{bucket_name}.s3-website-{region}.amazonaws.com"
    return website_url

def main():
    print("Starting AWS Deployment...")
    try:
        image_identifier = setup_ecr_and_push_image()
        access_role_arn = create_apprunner_role()
        backend_url = deploy_app_runner(image_identifier, access_role_arn)
        print(f"Backend App Runner URL: {backend_url}")
        
        frontend_url = deploy_s3_frontend(backend_url)
        print(f"Frontend S3 Website URL: {frontend_url}")
        
        print("Deployment Initiated Successfully!")
        print(f"-> Access the frontend at: {frontend_url}")
    except Exception as e:
        print(f"Deployment failed: {e}")

if __name__ == "__main__":
    main()
