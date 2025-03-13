import copy
import json


def compare_arrays(local_episodes, remote_episodes):
    result = {
        "local": [],
        "remote": []
    }
    for episode in local_episodes:
        if episode not in remote_episodes:
            result["local"].append(episode)
        else:
            remote_episodes.remove(episode)
    result["remote"] = remote_episodes

    return result


def compare_directory_structures(local, remote):
    result = {
        "local": {},
        "remote": {}
    }
    shows_array = set(local.keys()) | set(remote.keys())
    for show in shows_array:
        if show not in remote:
            result["local"][show] = local[show]
        elif show not in local:
            result["remote"][show] = remote[show]
        else:
            seasons_array = set(local[show].keys()) | set(remote[show].keys())
            for season in seasons_array:
                if season not in remote[show]:
                    if show not in result["local"]:
                        result["local"][show] = {}
                    result["local"][show] = {**result["local"][show], season: local[show][season]}
                elif season not in local[show]:
                    if show not in result["remote"]:
                        result["remote"][show] = {}
                    result["remote"][show] = {**result["remote"][show], season: remote[show][season]}
                else:
                    local_episodes = copy.deepcopy(local[show][season])
                    remote_episodes = copy.deepcopy(remote[show][season])
                    comparison = compare_arrays(local_episodes, remote_episodes)
                    if len(local_episodes):
                        print(f'populating lopcal with {local_episodes}')
                        if show not in result["local"]:
                            result["local"][show] = {}
                        result["local"][show] = {**result["local"][show], season: comparison["local"]}
                    if len(remote_episodes):
                        if show not in result["remote"]:
                            result["remote"][show] = {}
                        result["remote"][show] = {**result["remote"][show], season: comparison["remote"]}

    return result


class DirectoryComparisonService:
    def __init__(self):
        self.comparison_result = None

    def display_directory_structure_differences(self):
        # TODO: implement this function to print the different between directories _better_
        print(json.dumps(self.comparison_result, indent=2))

    def compare_directory_structures(self, local, remote):
        self.comparison_result = compare_directory_structures(local, remote)
        self.display_directory_structure_differences()
        return self.comparison_result