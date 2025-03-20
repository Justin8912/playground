Notes
==
Design decisions about the application will be stored here. 

Interface
--
I will create a website that will allow users to:
1. Select which transaction they want to complete
   1. Synchronize from Spotify to YouTube Music 
   2. Synchronize from Youtube Music to Spotify 
   3. Choose from whose library they would like to integration from 
      1. IE. 
         1. User A's Spotify library to User B's YouTube Music library
         2. Or User B's YouTube Music Library to User A's Spotify library 

2. View the differences and approve the changes before they are made 
3. Log out an errors that may have occurred as a result of the transaction 

API
--
For MVP the only changes allowed will be additive. 

The API should have the following capabilities:
1. Retrieve and store user's Client IDs and Secrets in SSM
2. Read from and write to YouTube music and spotify
3. Return a dry run of the changes that will be made upon user's request
4. Execute the changes from that dry run 

Ideally I will store the LEAST amount of information about music in either playlist. 

Ideally playlists could look like this:

```json
{
   "title": "Playlist Title",
   "sourceApplication": "YtMusic | Spotify",
   "songs": "Song[]"
}
```

Ideally songs could look like this:
```json 
{
  "title": "",
  "artist": "",
  "album": "",
  "duration": ""
}
```

