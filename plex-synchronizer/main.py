import paramiko
import scp
from util.directory_parser import directory_parser
from util.handle_file_transfer import handle_file_transfer
import json
import copy


def get_server_client(ip, username="jnste"):
    client = paramiko.SSHClient()
    client.load_system_host_keys()
    client.connect(ip, username=username)
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
                    if show not in result["local"]:
                        result["local"][show] = {}
                    if show not in result["remote"]:
                        result["remote"][show] = {}

                    result["local"][show] = {**result["local"][show], season: comparison["local"]}
                    result["remote"][show] = {**result["remote"][show], season: comparison["remote"]}

    return result


def appConfig():
    server = {
        "ip": "100.82.133.11",
        "username": "jnste"
    }

    sshClient = get_server_client(**server)
    scpClient = scp.SCPClient(sshClient.get_transport())

    return {
        "server": server,
        "sshClient": sshClient,
        "scpClient": scpClient,
        "local_path": "./tv",
        "remote_path": "/home/jnste/test/plex-source-data/tv"
    }

def main():
    server, sshClient, scpClient, local_path, remote_path = appConfig().values()

    local = directory_parser(local_path)
    remote = transfer_and_execute_script(sshClient, scpClient, remote_path)

    comparison_result = compare_directory_structures(local, remote)
    print(json.dumps(comparison_result, indent=2))

    localToRemote = int(input("Would you like to transfer from local to remote (1) or remote to local (2)?"))
    while ((not localToRemote == 1 and not localToRemote == 2)):
        localToRemote = int(input("Please choose a valid option: local to remote (1) or remote to local (2).\nPress ctrl+C to exit. "))

    if localToRemote == 1:
        fromLocalToRemote = True
        tvshow_results = comparison_result["local"]
        handle_file_transfer(local_path, remote_path, comparison_result["local"], True, sshClient, server["ip"])
    elif localToRemote == 2:
        fromLocalToRemote = False
        tvshow_results = comparison_result["remote"]

    handle_file_transfer(local_path, remote_path, tvshow_results, fromLocalToRemote, sshClient, server["ip"])
main()