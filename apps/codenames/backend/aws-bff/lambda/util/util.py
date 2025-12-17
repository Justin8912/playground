def get_intersection_and_format_input_arrays(arr1, arr2):
    intersection = []
    for i in arr1:
        if (i in arr2): intersection.append(i)
    arr1_clean = [x for x in arr1 if x not in intersection]
    arr2_clean = [x for x in arr2 if x not in intersection]
    return intersection, arr1_clean, arr2_clean


def remove_indexes(arr: list, indexes: list[int]) -> list:
    for i in sorted(indexes, reverse=True):
        if 0 <= i < len(arr):
            del arr[i]
    return arr

def getConfig(ruleset):
    with open("./config.json", 'r') as file:
        config = json.load(file)
        return config[ruleset]


def getSelectedWords():
    total_words = []
    with open('words.txt') as f:
        words = [line.strip() for line in f]
        total_words.extend(words)
    return random.sample(total_words, 25)