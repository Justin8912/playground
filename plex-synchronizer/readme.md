Requirements
==
tv directory
--
- Get all the information for each tv show available (all episodes within all seasons)
- Return an object with the information required 
- Compare the information with the system that is running the script 
- Either upload (the content that is not present on the server) or download (content missing on the source machine)

If the server had a directory like this:
```
-> severance 
    -> Season 01 
        -> Episode 1
        -> Epsiode 2 
-> Arcane
    -> Season 01 
        -> ...
    -> Season 02
        -> ...
```

Then I would want an object that looks like this to be returned from the `get_directory_structure` function:

```json
{
    "severance": {
        "Season 01": ["Episode 1", "Episode 2"]
    },
    "Arcane": {
        "Season 01": [/*...*/],
        "Season 02": [/*...*/], 
    }
}
```

Then, I can use this function on both the home server and the computer I am running the comparison against. 

Lets say the local computer has a directory structure that looks liek this:
```
-> severance 
    -> Season 01 
        -> Episode 1
        -> Epsiode 3 
-> Arcane
    -> Season 01 
        -> ...
    -> Season 02
        -> ...
-> Breaking Bad
    -> Season 01
        -> ...
```

I would want the comparison to return only differences in what the source has that the target does not
```json
{
    "source": {
        "severance": {
            "Season 01": ["Episode 3"]
        },
        "Breaking Bad": {
            "Season 01": [/*...*/]
        }
    },
    "target": {
        "severance": {
            "Season 01": ["Episode 2"]
        }
    }   
}
```

Then there could be flags for uploading or downloading.