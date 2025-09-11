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
    def filter_empty(d):
        # Remove seasons with empty episode lists, and shows with empty dicts
        return {
            show: {
                season: episodes
                for season, episodes in seasons.items() if episodes
            }
            for show, seasons in d.items() if any(episodes for episodes in seasons.values())
        }

    def get_season_diffs(local_seasons, remote_seasons):
        seasons = set(local_seasons.keys()) | set(remote_seasons.keys())
        local_diff, remote_diff = {}, {}
        for season in seasons:
            if season not in remote_seasons:
                local_diff[season] = local_seasons[season]
            elif season not in local_seasons:
                remote_diff[season] = remote_seasons[season]
            else:
                comparison = compare_arrays(local_seasons[season], remote_seasons[season])
                if comparison["local"]:
                    local_diff[season] = comparison["local"]
                if comparison["remote"]:
                    remote_diff[season] = comparison["remote"]
        return local_diff, remote_diff

    result = {"local": {}, "remote": {}}
    all_shows = set(local.keys()) | set(remote.keys())
    for show in all_shows:
        if show not in remote:
            result["local"][show] = local[show]
        elif show not in local:
            result["remote"][show] = remote[show]
        else:
            local_seasons, remote_seasons = local[show], remote[show]
            local_diff, remote_diff = get_season_diffs(local_seasons, remote_seasons)
            if local_diff:
                result["local"][show] = local_diff
            if remote_diff:
                result["remote"][show] = remote_diff

    result["local"] = filter_empty(result["local"])
    result["remote"] = filter_empty(result["remote"])
    return result


class DirectoryComparisonService:
    def __init__(self):
        self.comparison_result = None

    def display_directory_structure_differences(self):
        # TODO: implement this function to print the different between directories _better_
        print(json.dumps(self.comparison_result["local"], indent=2))
        exit

    def compare_directory_structures(self, local, remote):
        self.comparison_result = compare_directory_structures(local, remote)
        self.display_directory_structure_differences()
        return self.comparison_result