import random
import json
from util.util import remove_indexes, get_intersection_and_format_input_arrays, getConfig, getSelectedWords

def createCard(word, owner, classification):
    return {
        "word": word,
        "owner": owner,
        "lastSelectedBy": "none",
        "classification": classification
    }

def generateMultiplayerCards(selected_words, config):
    cards = []

    for team in config["teams"]:
        for i in range(team.get("startingCards")):
            cards.append(createCard(selected_words.pop(), [team.get("name")], "clue"))
    for i in range(config["assassinCards"]):
        cards.append(createCard(selected_words.pop(), ["blue", "red"], "assassin"))
    while len(cards) < 25:
        cards.append(createCard(selected_words.pop(), "none", "bystander"))
    random.shuffle(cards)

    return cards

def generateDuosCards(selected_words, config):
    cards = []
    def generateAndAssignCards(selected_words, startingCards1, startingCards2, classification):
        selectionForGreen1 = random.sample(range(len(selected_words)), startingCards1)
        selectionForGreen2 = random.sample(range(len(selected_words)), startingCards2)
        intersection, uniqueGreen1, uniqueGreen2 = get_intersection_and_format_input_arrays(selectionForGreen1, selectionForGreen2)
        for index in intersection:
            cards.append(createCard(selected_words[index], ["green1", "green2"], classification))
        for index in uniqueGreen1:
            cards.append(createCard(selected_words[index], ["green1"], classification))
        for index in uniqueGreen2:
            cards.append(createCard(selected_words[index], ["green2"], classification))

        selected_words = remove_indexes(selected_words, list(intersection + uniqueGreen1 + uniqueGreen2))
        return selected_words

    selected_words = generateAndAssignCards(selected_words, config.get("teams")[0].get("startingCards"), config.get("teams")[1].get("startingCards"), "clue")

    assassinCards = config.get("assassinCards")

    selected_words = generateAndAssignCards(selected_words, assassinCards, assassinCards, "assassin")

    for word in selected_words:
        cards.append(createCard(word, ["none"], "bystander"))

    random.shuffle(cards)
    return cards

def handler(event, lambda_context):
    ruleset = event.get("ruleset")

    selected_words = getSelectedWords()
    config = getConfig(ruleset)

    if (ruleset == "multiplayer"):
        return generateMultiplayerCards(selected_words, config)
    elif (ruleset == "duos"):
        return generateDuosCards(selected_words, config)
