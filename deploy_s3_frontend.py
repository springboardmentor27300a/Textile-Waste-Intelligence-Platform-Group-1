import boto3
import os
import mimetypes
import json
import time
from botocore.exceptions import ClientError

def deploy_s3_frontend(backend_url):
    print(f"Deploying Frontend to S3 pointing to {backend_url}")
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
    print(f"Frontend successfully deployed to: {website_url}")

if __name__ == "__main__":
    deploy_s3_frontend("http://twip-backend-env.eba-ms8hqq3h.us-east-1.elasticbeanstalk.com")
