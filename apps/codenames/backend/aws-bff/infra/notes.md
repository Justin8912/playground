Terraform in AWS
==
Credentials
--
While working with terraform on my personal account, I found that the most seamless way to get 
credentials was to do the following:

```bash
aws login --profile personal
export AWS_PROFILE=personal
eval $(aws configure export-credentials --profile personal --format env)
export AWS_DEFAULT_REGION=us-east-1
```

EC2
--
I found the easiest way to interact with EC2 was through ssm session manager. To start a session, 
run the following command:

```bash
aws ssm start-session --target <instance-id>
```