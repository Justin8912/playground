import subprocess
import os


# In order for the download function to work, the tv show's directory / season directory must be present
#     So this function will check to see if the directory is there already or not
def create_directory_if_not_exists_local(path):
    os.makedirs(path, exist_ok=True)


def create_directory_if_not_exists_remote(sshClient, path):
    sshClient.exec_command(f'mkdir -p "{path}"')


class FileTransferService:
    def __init__(self, appConfig):
        self.local = appConfig.get_local_path()
        self.remote = appConfig.get_remote_path()
        self.sshClient = appConfig.get_ssh_client()

        ip, username = appConfig.get_server().values()
        self.ip = ip
        self.username = username

    def handle_diff_file_transfer(self, tvshows, fromLocalToRemote:bool):
        for show in tvshows:
            for season in tvshows[show]:
                local_path = f'{self.local}/{show}/{season}'
                remote_path = f'{self.remote}/{show}/{season}'
                for episode in tvshows[show][season]:
                    if fromLocalToRemote:
                        create_directory_if_not_exists_remote(self.sshClient, f'{remote_path}/')
                        subprocess.run(['scp', f'{local_path}/{episode}', f'{self.username}@{self.ip}:{remote_path}'])
                    else:
                        create_directory_if_not_exists_local(local_path)
                        subprocess.run(['scp', f'{self.username}@{self.ip}:{remote_path}/{episode}', f'{local_path}/{episode}'])
