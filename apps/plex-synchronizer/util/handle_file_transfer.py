import subprocess
import os


# In order for the download function to work, the tv show's directory / season directory must be present
#     So this function will check to see if the directory is there already or not
def create_directory_if_not_exists_local(path):
    os.makedirs(path, exist_ok=True)


def create_directory_if_not_exists_remote(sshClient, path):
    sshClient.exec_command(f'mkdir -p "{path}"')


def handle_file_transfer(local, remote, tvshows, fromLocalToRemote:bool, sshClient, ip):
    for show in tvshows:
        for season in tvshows[show]:
            local_path = f'{local}/{show}/{season}'
            remote_path = f'{remote}/{show}/{season}'
            for episode in tvshows[show][season]:
                if fromLocalToRemote:
                    create_directory_if_not_exists_remote(sshClient, f'{remote_path}/')
                    subprocess.run(['scp', f'{local_path}/{episode}', f'jnste@{ip}:{remote_path}'])
                else:
                    create_directory_if_not_exists_local(local_path)
                    subprocess.run(['scp', f'jnste@{ip}:{remote_path}/{episode}', f'{local_path}/{episode}'])
