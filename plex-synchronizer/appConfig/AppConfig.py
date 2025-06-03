import paramiko
from service.FileTransferService import FileTransferService
from service.DirectoryComparisonService import DirectoryComparisonService


def get_server_client(ip, username="jnste"):
    client = paramiko.SSHClient()
    client.load_system_host_keys()
    client.connect(ip, username=username)
    return client


class AppConfig:
    def __init__(self):
        self.server = {
            "ip": "192.168.1.159",
            "username": "jnste"
        }
        self.local_path = "C:\\Users\\jnste\\OneDrive\\Pictures\\tv"
        self.remote_path = "/home/jnste/storage/media/tv"
        self.sshClient = get_server_client(**self.server)
        self.fileTransferService = FileTransferService(self)
        self.directoryComparisonService = DirectoryComparisonService()

    def set_local_path(self, path):
        self.local_path = path

    def get_local_path(self):
        return self.local_path

    def get_remote_path(self):
        return self.remote_path

    def get_ssh_client(self):
        return self.sshClient

    def get_server(self):
        return self.server

    def get_file_transfer_service(self):
        return self.fileTransferService

    def get_directory_comparison_service(self):
        return self.directoryComparisonService