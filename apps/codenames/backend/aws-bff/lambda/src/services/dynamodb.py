import uuid
import boto3
from boto3.dynamodb.types import TypeSerializer

class DynamoService:
    def __init__(self, tableName):
        self.dynamoClient = boto3.client('dynamodb')
        self.tableName = tableName

    def setGsiName(self, gsiName):
        self.gsiName = gsiName

    def batchWriteCards(self, cards, gameId):
        writeRequests = []

        for card in cards:
            writeRequests.append({
                'PutRequest': {
                    'Item': {
                        'PartitionKey': {'S': str(uuid.uuid4())},
                        'SortKey': {'S': 'Card'},
                        'GameId': {'S': gameId},
                        'Word': {'S': card['word']},
                        'Owner': TypeSerializer().serialize(card['owner']),
                        'Classification': {'S': card['classification']},
                        'LastSelectedBy': {'S': card['lastSelectedBy']}
                    }
                }
            })

        requestItems = {
            'RequestItems': {
                self.tableName: writeRequests
            }
        }

        self.dynamoClient.batch_write_item(**requestItems)

    def saveGameToDynamo(self, ruleset):
        gameId = str(uuid.uuid4())

        self.dynamoClient.put_item(
            TableName=self.tableName,
            Item={
                'PartitionKey': {'S': gameId},
                'SortKey': {'S': 'Game'},
                'Ruleset': {'S': ruleset}
            }
        )

        return gameId


    def getCardsFromGame(self, gameId):
        query_params = {
            'IndexName': self.gsiName,
            'TableName': self.tableName,
            'KeyConditionExpression': f'GameId = :gameId AND SortKey = :sortKey',
            'ExpressionAttributeValues': {
                ':gameId': {'S': gameId},
                ':sortKey': {'S': 'Card'}
            }
        }
        response = self.dynamoClient.query(**query_params)
        return response['Items']

    def deleteCardsFromDynamo(self, gameId):
        cards = self.getCardsFromGame(gameId)
        deleteRequests = []

        for card in cards:
            deleteRequests.append({
                'DeleteRequest': {
                    'Key': {
                        'PartitionKey': card['PartitionKey'],
                        'SortKey': {'S': 'Card'}
                    }
                }
            })

        requestItems = {
            'RequestItems': {
                self.tableName: deleteRequests
            }
        }

        self.dynamoClient.batch_write_item(**requestItems)

    def deleteGameFromDynamo(self, gameId):
        self.dynamoClient.delete_item(
            TableName=self.tableName,
            Key={
                'PartitionKey': {'S': gameId},
                'SortKey': {'S': 'Game'}
            }
        )