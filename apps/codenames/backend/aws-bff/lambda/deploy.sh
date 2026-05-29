cd ./src
zip -rq ../lambda.zip ./
cd -
aws lambda update-function-code \
  --function-name codenames-game-board-handler \
  --zip-file fileb://lambda.zip
