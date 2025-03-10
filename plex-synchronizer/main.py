import paramiko
import scp
from util.directory_parser import directory_parser


def get_server_client(username: str, password: str):
    client = paramiko.SSHClient()
    client.load_system_host_keys()
    client.connect('192.168.1.159', username=username, password=password)
    return client


def transfer_and_execute_script(client, path: str):
    scp_client = scp.SCPClient(client.get_transport())
    scp_client.put("util/directory_parser.py", remote_path=f'{path}/directory_parser.py')
    command = f'python3 {path}/directory_parser.py {path}'
    stdin, stdout, stderr = client.exec_command(command)

    error = stderr.read().decode()
    if error:
        raise Exception(error)

    result = stdout.read().decode()
    stdin, stdout, stderr = client.exec_command(f'rm {path}/directory_parser.py')

    error = stderr.read().decode()
    if error:
        print("Could not successfully remove the remote_script, this may cause issues for future runs: " + error)

    return result


def compare_directory_structures(local, remote):
    result = {
        "local": {},
        "remote": {}
    }
    print(local)
    for show, seasons in local.items():
        # print(f'show {show} seasons {seasons}')
        for season, episodes in seasons.items():
            print(f'season {season}')
            for episode in episodes:
                print(f'episode {episode}')


def main():
    local = directory_parser("./")
    remote = transfer_and_execute_script(get_server_client("jnste", ""), "/home/jnste/test/plex-source-data")

    compare_directory_structures(local, remote)


main()