import paramiko
import scp


class AppConfig:
    def __init__(self):
        self.server = {
            "ip": "100.82.133.11",
            "username": "jnste"
        }
        self.local_path = "./tv"
        self.remote_path = "/home/jnste/test/plex-source-data/tv"
        self.sshClient = None
        self.scpClient = None
        self.initialize()

    def initialize(self):
        self.sshClient = self.get_server_client(**self.server)
        self.scpClient = scp.SCPClient(self.sshClient.get_transport())

    def get_server_client(self, ip, username="jnste"):
        client = paramiko.SSHClient()
        client.load_system_host_keys()
        client.connect(ip, username=username)
        return client

    def set_local_path(self, path):
        self.local_path = path

    def get_local_path(self):
        return self.local_path

    def get_remote_path(self):
        return self.remote_path

    def get_ssh_client(self):
        return self.sshClient

    def get_scp_client(self):
        return self.scpClient

    def get_server(self):
        return self.server