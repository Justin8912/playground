export const HOME_SERVER = {
    ip: "192.168.1.93",
    user: "jnste",
    directory: "/home/jnste/storage/media/movies"
}

const DRIVE_TO_DIRECTORY_MAP = {
    "C": "C:\\Users\\jnste\\OneDrive\\Pictures\\Movies\\"
};

export const getBaseDirectoryPath = (driveLetter) => {
    return DRIVE_TO_DIRECTORY_MAP[driveLetter.toUpperCase()] || `${driveLetter}:\\movies\\`;
}