import os
import json
import argparse

def directory_parser(path:str):
    shows = os.listdir(f'{path}')
    result = {}
    for show in shows:
        seasons_obj = {}
        seasons = os.listdir(f'{path}/{show}')
        for season in seasons:
            if (not os.path.isdir(f'{path}/{show}/{season}')): continue
            episodes = os.listdir(f'{path}/{show}/{season}')
            seasons_obj[season] = episodes
        result[show] = seasons_obj

    return result

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Parse directory structure.')
    parser.add_argument('path', type=str, help='The path to the directory to parse')
    args = parser.parse_args()

    directory_structure = directory_parser(args.path)
    print(json.dumps(directory_structure, indent=4))