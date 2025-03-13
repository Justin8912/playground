from util.directory_parser import directory_parser
from appConfig.AppConfig import AppConfig
import json


def transfer_and_execute_script(sshClient, transfer_file_to_remote, path: str):
    transfer_file_to_remote("util/directory_parser.py", f'{path}/../directory_parser.py')
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


def main():
    config = AppConfig()

    local_directory_structure = directory_parser(config.get_local_path())
    remote_directory_structure = transfer_and_execute_script(
        config.get_ssh_client(),
        config.get_file_transfer_service().transfer_file_to_remote,
        config.get_remote_path()
    )

    comparison_result = config.get_directory_comparison_service().compare_directory_structures(
        local_directory_structure,
        remote_directory_structure
    )

    local_to_remote = int(input("Would you like to transfer from local to remote (1) or remote to local (2)?"))
    while not local_to_remote == 1 and not local_to_remote == 2:
        local_to_remote = int(input("Please choose a valid option: local to remote (1) or remote to local (2).\nPress "
                                    "ctrl+C to exit. "))

    if local_to_remote == 1:
        from_local_to_remote = True
        tvshow_results = comparison_result["local"]
    else:
        from_local_to_remote = False
        tvshow_results = comparison_result["remote"]

    config.get_file_transfer_service().handle_diff_file_transfer(
        tvshow_results,
        from_local_to_remote
    )


main()