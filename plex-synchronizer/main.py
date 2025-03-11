import paramiko
import scp
from util.directory_parser import directory_parser
import json
import copy


def get_server_client(username: str, password: str):
    client = paramiko.SSHClient()
    client.load_system_host_keys()
    client.connect('192.168.1.159', username=username, password=password)
    return client


def transfer_and_execute_script(sshClient, scpClient, path: str):
    scpClient.put("util/directory_parser.py", remote_path=f'{path}/../directory_parser.py')
    command = f'python3 {path}/../directory_parser.py {path}'
    stdin, stdout, stderr = sshClient.exec_command(command)

    error = stderr.read().decode()
    if error:
        raise Exception(error)

    result = stdout.read().decode()
    stdin, stdout, stderr = sshClient.exec_command(f'rm {path}/../directory_parser.py')

    error = stderr.read().decode()
    if error:
        print("Could not successfully remove the remote_script, this may cause issues for future runs: " + error)

    return json.loads(result)


def compare_arrays(local_episodes, remote_episodes):
    print("Comparing Arrays: ", local_episodes)
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
    # find the list of shows
    shows_array = set(local.keys()) | set(remote.keys())
    # for show in the list
    for show in shows_array:
        print(show)
        if show not in remote:
            result["local"][show] = local[show]
        elif show not in local:
            result["remote"][show] = remote[show]
        else:
            seasons_array = set(local[show].keys()) | set(remote[show].keys())
            for season in seasons_array:
                print("\t->", season)
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
                    if show not in result["local"]:
                        result["local"][show] = {}
                    if show not in result["remote"]:
                        result["remote"][show] = {}

                    result["local"][show] = {**result["local"][show], season: comparison["local"]}
                    result["remote"][show] = {**result["remote"][show], season: comparison["remote"]}

    print(result)



def main():
    local_path = "./tv"
    remote_path = "/home/jnste/test/plex-source-data/tv"

    local = directory_parser(local_path)
    sshClient = get_server_client("jnste", "")
    scpClient = scp.SCPClient(sshClient.get_transport())
    remote = transfer_and_execute_script(sshClient, scpClient, remote_path)
    compare_directory_structures(local, remote)


main()