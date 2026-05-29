export const schema = {
    "models": {},
    "enums": {
        "Team": {
            "name": "Team",
            "values": [
                "Blue",
                "Red",
                "Green1",
                "Green2",
                "None"
            ]
        },
        "Ruleset": {
            "name": "Ruleset",
            "values": [
                "duos",
                "multiplayer"
            ]
        },
        "Classification": {
            "name": "Classification",
            "values": [
                "Assassin",
                "Bystander",
                "Clue"
            ]
        }
    },
    "nonModels": {
        "Game": {
            "name": "Game",
            "fields": {
                "PartitionKey": {
                    "name": "PartitionKey",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "Ruleset": {
                    "name": "Ruleset",
                    "isArray": false,
                    "type": {
                        "enum": "Ruleset"
                    },
                    "isRequired": true,
                    "attributes": []
                },
                "cards": {
                    "name": "cards",
                    "isArray": true,
                    "type": {
                        "nonModel": "Card"
                    },
                    "isRequired": true,
                    "attributes": [],
                    "isArrayNullable": false
                }
            }
        },
        "Card": {
            "name": "Card",
            "fields": {
                "PartitionKey": {
                    "name": "PartitionKey",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "Word": {
                    "name": "Word",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "Owner": {
                    "name": "Owner",
                    "isArray": true,
                    "type": {
                        "enum": "Team"
                    },
                    "isRequired": true,
                    "attributes": [],
                    "isArrayNullable": true
                },
                "LastSelectedBy": {
                    "name": "LastSelectedBy",
                    "isArray": false,
                    "type": {
                        "enum": "Team"
                    },
                    "isRequired": false,
                    "attributes": []
                },
                "Classification": {
                    "name": "Classification",
                    "isArray": false,
                    "type": {
                        "enum": "Classification"
                    },
                    "isRequired": false,
                    "attributes": []
                },
                "GameId": {
                    "name": "GameId",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                }
            }
        },
        "CreateGameReturn": {
            "name": "CreateGameReturn",
            "fields": {
                "status": {
                    "name": "status",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "gameId": {
                    "name": "gameId",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                }
            }
        },
        "DeleteGameReturn": {
            "name": "DeleteGameReturn",
            "fields": {
                "status": {
                    "name": "status",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "message": {
                    "name": "message",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                }
            }
        }
    },
    "codegenVersion": "3.4.4",
    "version": "d7851ac257f264ebd19470a110acbfb2"
};