# In order to get the terraform running, I HAD to run this script first to set the AWS credentials
#aws login --profile personal
export AWS_PROFILE=personal
eval $(aws configure export-credentials --profile personal --format env)
export AWS_DEFAULT_REGION=us-east-1
