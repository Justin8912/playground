cd ./src
zip -rq ../lambda.zip ./
cd -
aws lambda update-function-code --function-name codenames-deck-generator --zip-file fileb://lambda.zip
