import random
import json
import os
from businessLogic.businessLogic import generateDeck, saveToDynamo, deleteGameFromDynamo
from services.dynamodb import DynamoService

dynamoService = DynamoService(os.environ['DYNAMODB_TABLE_NAME'])

def handleCreateCards(ruleset):
    deck = generateDeck(ruleset)
    return saveToDynamo(dynamoService, ruleset, deck)

def handleDeleteGame(gameId):
    dynamoService.setGsiName(os.environ['DYNAMODB_GSI_NAME'])
    return deleteGameFromDynamo(dynamoService, gameId)

def handler(event, lambda_context):
    if event.get("type").lower() == "create":
        return handleCreateCards(event.get("ruleset").lower())
    elif event.get("type").lower() == "delete":
        return handleDeleteGame(event.get("gameId"))

print(handler({"type": "create", "ruleset": "multiplayer"}, None))