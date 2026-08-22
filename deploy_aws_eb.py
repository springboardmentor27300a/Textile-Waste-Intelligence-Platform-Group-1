import boto3
import json
import time
import os
import mimetypes
import zipfile
from botocore.exceptions import ClientError

def create_eb_roles():
    iam = boto3.client('iam')
    ec2_role_name = 'aws-elasticbeanstalk-ec2-role'
    
    assume_role_policy = {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "Service": "ec2.amazonaws.com"
          },
          "Action": "sts:AssumeRole"
        }
      ]
    }
    
    try:
        iam.get_role(RoleName=ec2_role_name)
        print(f"Role {ec2_role_name} exists.")
    except iam.exceptions.NoSuchEntityException:
        print(f"Creating role {ec2_role_name}...")
        iam.create_role(
            RoleName=ec2_role_name,
            AssumeRolePolicyDocument=json.dumps(assume_role_policy)
        )
        iam.attach_role_policy(RoleName=ec2_role_name, PolicyArn='arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier')
        iam.attach_role_policy(RoleName=ec2_role_name, PolicyArn='arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker')
        iam.attach_role_policy(RoleName=ec2_role_name, PolicyArn='arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier')
        print("Role created. Waiting 10 seconds for propagation...")
        time.sleep(10)
        
    # Create Instance Profile
    try:
        iam.get_instance_profile(InstanceProfileName=ec2_role_name)
        print(f"Instance profile {ec2_role_name} exists.")
    except iam.exceptions.NoSuchEntityException:
        iam.create_instance_profile(InstanceProfileName=ec2_role_name)
        iam.add_role_to_instance_profile(InstanceProfileName=ec2_role_name, RoleName=ec2_role_name)
        print("Instance profile created. Waiting 10 seconds for propagation...")
        time.sleep(10)

def deploy_backend_eb():
    print("--- Deploying Backend to Elastic Beanstalk ---")
    sts = boto3.client('sts')
    account_id = sts.get_caller_identity()['Account']
    region = boto3.session.Session().region_name
    s3 = boto3.client('s3')
    eb = boto3.client('elasticbeanstalk')
    
    app_name = 'twip-backend'
    env_name = 'twip-backend-env'
    bucket_name = f"twip-deploy-{account_id}-{region}"
    zip_name = 'backend.zip'
    
    # 1. Create S3 Bucket
    try:
        s3.head_bucket(Bucket=bucket_name)
    except ClientError:
        print(f"Creating bucket {bucket_name}...")
        if region == 'us-east-1':
            s3.create_bucket(Bucket=bucket_name)
        else:
            s3.create_bucket(Bucket=bucket_name, CreateBucketConfiguration={'LocationConstraint': region})
            
    # 2. Zip backend directory
    print("Zipping backend directory...")
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('backend'):
            for file in files:
                file_path = os.path.join(root, file)
                if '__pycache__' not in file_path and '.git' not in file_path and 'venv' not in file_path:
                    # Store in zip without the leading 'backend/' directory
                    arcname = os.path.relpath(file_path, 'backend')
                    zipf.write(file_path, arcname)
                    
    # 3. Upload to S3
    print("Uploading to S3...")
    version_label = f"v{int(time.time())}"
    s3_key = f"{app_name}/{version_label}.zip"
    s3.upload_file(zip_name, bucket_name, s3_key)
    
    # 4. Ensure Application exists
    apps = eb.describe_applications(ApplicationNames=[app_name])['Applications']
    if not apps:
        print(f"Creating EB Application {app_name}...")
        eb.create_application(ApplicationName=app_name)
        
    # 5. Create Application Version
    print(f"Creating Application Version {version_label}...")
    eb.create_application_version(
        ApplicationName=app_name,
        VersionLabel=version_label,
        SourceBundle={'S3Bucket': bucket_name, 'S3Key': s3_key},
        Process=True
    )
    
    # 6. Ensure Environment exists
    envs = eb.describe_environments(ApplicationName=app_name, EnvironmentNames=[env_name])['Environments']
    active_envs = [e for e in envs if e['Status'] != 'Terminated']
    
    if active_envs:
        print(f"Updating Environment {env_name}...")
        eb.update_environment(
            EnvironmentName=env_name,
            VersionLabel=version_label
        )
        url = active_envs[0]['CNAME']
        print(f"Update initiated. App will be available at: http://{url}")
        return f"http://{url}"
    else:
        print(f"Creating Environment {env_name}...")
        # Get Docker solution stack
        stacks = eb.list_available_solution_stacks()['SolutionStacks']
        docker_stack = next(s for s in stacks if 'Docker' in s and 'running Docker' in s)
        
        response = eb.create_environment(
            ApplicationName=app_name,
            EnvironmentName=env_name,
            VersionLabel=version_label,
            SolutionStackName=docker_stack,
            OptionSettings=[
                {
                    'Namespace': 'aws:autoscaling:launchconfiguration',
                    'OptionName': 'IamInstanceProfile',
                    'Value': 'aws-elasticbeanstalk-ec2-role'
                },
                {
                    'Namespace': 'aws:elasticbeanstalk:application:environment',
                    'OptionName': 'PORT',
                    'Value': '8000'
                }
            ]
        )
        url = response.get('CNAME', f"{env_name}.elasticbeanstalk.com")
        print(f"Creation initiated (takes ~10-15 mins). App will be available at: http://{url}")
        return f"http://{url}"

def deploy_s3_frontend(backend_url):
    print("--- Deploying Frontend to S3 ---")
    sts = boto3.client('sts')
    s3 = boto3.client('s3')
    account_id = sts.get_caller_identity()['Account']
    region = boto3.session.Session().region_name
    
    bucket_name = f'twip-frontend-{account_id}-{region}'
    
    try:
        s3.head_bucket(Bucket=bucket_name)
    except ClientError:
        print(f"Creating bucket {bucket_name}...")
        if region == 'us-east-1':
            s3.create_bucket(Bucket=bucket_name)
        else:
            s3.create_bucket(Bucket=bucket_name, CreateBucketConfiguration={'LocationConstraint': region})
        
        s3.delete_public_access_block(Bucket=bucket_name)
        time.sleep(2)
        
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
            
            if s3_key == 'js/api.js':
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
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
    try:
        create_eb_roles()
        backend_url = deploy_backend_eb()
        frontend_url = deploy_s3_frontend(backend_url)
        print("\n=== DEPLOYMENT STARTED ===")
        print(f"Backend API (Elastic Beanstalk): {backend_url}")
        print(f"Frontend App (S3 Website):       {frontend_url}")
        print("Note: Elastic Beanstalk takes ~10-15 minutes to fully provision.")
    except Exception as e:
        print(f"Deployment failed: {e}")

if __name__ == "__main__":
    main()
