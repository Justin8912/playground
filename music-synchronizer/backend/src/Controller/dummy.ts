import {AppConfig} from "../Config/AppConfig.js";
import {getYoutubeMusicService} from "../Services/YoutubeMusicClientService.js";

export const dummy = async (req, res) => {
    let appConfig = new AppConfig();
    await appConfig.initialize();
    let musicService = await getYoutubeMusicService("justin", appConfig.getHcpVaultService());
    let response = await musicService.getPlaylists();
    res.json(response);
}

export const dummyMemoryObject = `
    {
    "confidentProposedChanges": [
        {
            "sourceSong": {
                "title": "leavemealone",
                "artists": [
                    "Fred again..",
                    "Baby Keem"
                ],
                "videoId": "spotify:track:2vOjCXKZ5kcbmzOJ1ylT1h"
            },
            "targetSong": {
                "title": "Fred again.. &amp; Baby Keem - leavemealone",
                "artists": [
                    "Fred again . ."
                ],
                "description": "I fuckin love keem. Obviously. Ever since sonny first played me his music years ago. Hangin out wit him recently has been a real ...",
                "videoId": "rNv8K8AYGi8"
            }
        },
        {
            "sourceSong": {
                "title": "Bombalaya - Blooom Remix",
                "artists": [
                    "DNMO",
                    "Wolfy Lights",
                    "Blooom"
                ],
                "videoId": "spotify:track:5utINKwnXh1drV2vI9cnze"
            },
            "targetSong": {
                "title": "DNMO &amp; Wolfy Lights - Bombalaya (Blooom Remix) [UKF15 Release]",
                "artists": [
                    "UKF Drum & Bass"
                ],
                "description": "DNMO x Wolfy Lights - Bombalaya (Blooom Remix) [UKF Release] ↳ Download/Stream ...",
                "videoId": "8eJJmVU4i4s"
            }
        },
        {
            "sourceSong": {
                "title": "Gunfinger (Salute)",
                "artists": [
                    "IRAH",
                    "Chase & Status"
                ],
                "videoId": "spotify:track:30aEleGsSvwoORcXA4mKgT"
            },
            "targetSong": {
                "title": "IRAH - Gunfinger (Salute) ft. Chase &amp; Status (Visualiser)",
                "artists": [
                    "IRAH"
                ],
                "description": "The official Visualiser for Gunfinger (Salute) Stream Gunfinger (Salute) here: https://lnk.to/IRAH-Gunfinger Listen to the music of ...",
                "videoId": "ZbjFZxdCDU0"
            }
        },
        {
            "sourceSong": {
                "title": "Free",
                "artists": [
                    "Emz",
                    "Nasser UK",
                    "Valor"
                ],
                "videoId": "spotify:track:2C0IvokSio8N7UyHwuB638"
            },
            "targetSong": {
                "title": "Emz - Free (feat. Nasser &amp; Valor)",
                "artists": [
                    "Hospital Records"
                ],
                "description": "Buy or stream 'Free (feat. Nasser & Valor) here: https://emz.ffm.to/free.OYD Well in there in the ranks amongst Bristol's finest, MC ...",
                "videoId": "vh6tPkf5hMQ"
            }
        },
        {
            "sourceSong": {
                "title": "Bandz A Make Her Dance (feat. Lil' Wayne & 2 Chainz)",
                "artists": [
                    "Juicy J",
                    "Lil Wayne",
                    "2 Chainz"
                ],
                "videoId": "spotify:track:7EZPH9Px3gXlxD5KJDwtwc"
            },
            "targetSong": {
                "title": "Juicy J - Bandz A Make Her Dance (Official Video) ft. Lil&#39; Wayne, 2 Chainz",
                "artists": [
                    "TheJuicyJVEVO"
                ],
                "description": "Official Video for \\"Bandz A Make Her Dance ft. Lil Wayne & 2 Chainz\\" by Juicy J Listen to Juicy J: https://JuicyJ.lnk.to/listenID ...",
                "videoId": "AI0gk2KJeho"
            }
        },
        {
            "sourceSong": {
                "title": "BADDERS",
                "artists": [
                    "PEEKABOO",
                    "Flowdan",
                    "Skrillex",
                    "G-REX"
                ],
                "videoId": "spotify:track:4zbInBD4rY7tYPJ16LVxdh"
            },
            "targetSong": {
                "title": "Skrillex, PEEKABOO, Flowdan, &amp; G-Rex - Badders (Official Audio)",
                "artists": [
                    "Skrillex"
                ],
                "description": "Skrillex, PEEKABOO, Flowdan, & G-Rex - Badders (Official Audio) Listen Now - https://skrillex.lnk.to/baddersID Subscribe for more ...",
                "videoId": "YfpV3al_Q3k"
            }
        },
        {
            "sourceSong": {
                "title": "leavemealone",
                "artists": [
                    "Fred again..",
                    "Baby Keem"
                ],
                "videoId": "spotify:track:2vOjCXKZ5kcbmzOJ1ylT1h"
            },
            "targetSong": {
                "title": "Fred again.. &amp; Baby Keem - leavemealone",
                "artists": [
                    "Fred again . ."
                ],
                "description": "I fuckin love keem. Obviously. Ever since sonny first played me his music years ago. Hangin out wit him recently has been a real ...",
                "videoId": "rNv8K8AYGi8"
            }
        },
        {
            "sourceSong": {
                "title": "Napalm",
                "artists": [
                    "Pendulum",
                    "Joey Valence & Brae"
                ],
                "videoId": "spotify:track:6r24fIvdWIRT2qnpjmeyq6"
            },
            "targetSong": {
                "title": "Pendulum, Joey Valence &amp; Brae - Napalm (Visualiser)",
                "artists": [
                    "PendulumVEVO"
                ],
                "description": "Pendulum x Joey Valence & Brae – Napalm, out now Listen to 'Napalm' here: https://pendulum.lnk.to/napalm Subscribe to ...",
                "videoId": "8UYBR2HQ7cc"
            }
        },
        {
            "sourceSong": {
                "title": "Go Insane (feat. MC Offside)",
                "artists": [
                    "S3RL"
                ],
                "videoId": "spotify:track:5dJ3sEQZ9d6emrlTcnaOzG"
            },
            "targetSong": {
                "title": "Go Insane - S3RL feat MC Offside",
                "artists": [
                    "S3RL"
                ],
                "description": "Buy/Stream - https://S3RL.link/Go-Insane S3RL - https://S3RL.link Written by Jole Hughes and Dan Crang. Produced and ...",
                "videoId": "6U8t7p7n7F0"
            }
        },
        {
            "sourceSong": {
                "title": "Bombalaya - Blooom Remix",
                "artists": [
                    "DNMO",
                    "Wolfy Lights",
                    "Blooom"
                ],
                "videoId": "spotify:track:5utINKwnXh1drV2vI9cnze"
            },
            "targetSong": {
                "title": "DNMO &amp; Wolfy Lights - Bombalaya (Blooom Remix) [UKF15 Release]",
                "artists": [
                    "UKF Drum & Bass"
                ],
                "description": "DNMO x Wolfy Lights - Bombalaya (Blooom Remix) [UKF Release] ↳ Download/Stream ...",
                "videoId": "8eJJmVU4i4s"
            }
        },
        {
            "sourceSong": {
                "title": "Selecta (feat. Stefflon Don)",
                "artists": [
                    "Chase & Status",
                    "Stefflon Don"
                ],
                "videoId": "spotify:track:6TlFnB8GBrlILKv5qy27Sn"
            },
            "targetSong": {
                "title": "Selecta",
                "artists": [
                    "Chase & Status - Topic"
                ],
                "description": "Provided to YouTube by Universal Music Group Selecta · Chase & Status · Stefflon Don Selecta ℗ 2023 Chase & Status, under ...",
                "videoId": "to8uviu8cEQ"
            }
        },
        {
            "sourceSong": {
                "title": "leavemealone",
                "artists": [
                    "Fred again..",
                    "Baby Keem"
                ],
                "videoId": "spotify:track:2vOjCXKZ5kcbmzOJ1ylT1h"
            },
            "targetSong": {
                "title": "Fred again.. &amp; Baby Keem - leavemealone",
                "artists": [
                    "Fred again . ."
                ],
                "description": "I fuckin love keem. Obviously. Ever since sonny first played me his music years ago. Hangin out wit him recently has been a real ...",
                "videoId": "rNv8K8AYGi8"
            }
        },
        {
            "sourceSong": {
                "title": "So It Goes",
                "artists": [
                    "Mac Miller"
                ],
                "videoId": "spotify:track:0EA2RhRHL4KWeNa7JfD1Yw"
            },
            "targetSong": {
                "title": "Mac Miller - So It Goes",
                "artists": [
                    "Mac Miller"
                ],
                "description": "Listen to Swimming by Mac Miller: https://MacMiller.lnk.to/Swimming http://www.macmillerswebsite.com/ ...",
                "videoId": "Uf24Uk6ZMLQ"
            }
        },
        {
            "sourceSong": {
                "title": "Atmosphere",
                "artists": [
                    "FISHER",
                    "Kita Alexander"
                ],
                "videoId": "spotify:track:2We9qrzXzjpqVauR3wnKWc"
            },
            "targetSong": {
                "title": "FISHER x KITA ALEXANDER - ATMOSPHERE [LYRIC VIDEO]",
                "artists": [
                    "FISHER"
                ],
                "description": "ATMOSPHERE IS OUT NOW EVERYWHERE !! YOU GOT ME SPINNIN !!! OUT NOW WORLDWIDE ...",
                "videoId": "MlwBZ2MSNtE"
            }
        },
        {
            "sourceSong": {
                "title": "On The Block (feat. Sav'O & Horrid1)",
                "artists": [
                    "Chase & Status",
                    "Mozey",
                    "Sav'o",
                    "Horrid1"
                ],
                "videoId": "spotify:track:68bwt33eVNIbseelSwYUud"
            },
            "targetSong": {
                "title": "Chase &amp; Status, Mozey - On The Block (Visualiser) ft. Sav&#39;O, Horrid1",
                "artists": [
                    "ChaseAndStatusVEVO"
                ],
                "description": "The official visualiser for On The Block Listen to 2Ruff Vol 1: https://ChaseStatus.lnk.to/2ruff Stream the music of Chase & Status ...",
                "videoId": "Hn7LbwTIs8I"
            }
        },
        {
            "sourceSong": {
                "title": "Bombalaya - Blooom Remix",
                "artists": [
                    "DNMO",
                    "Wolfy Lights",
                    "Blooom"
                ],
                "videoId": "spotify:track:5utINKwnXh1drV2vI9cnze"
            },
            "targetSong": {
                "title": "DNMO &amp; Wolfy Lights - Bombalaya (Blooom Remix) [UKF15 Release]",
                "artists": [
                    "UKF Drum & Bass"
                ],
                "description": "DNMO x Wolfy Lights - Bombalaya (Blooom Remix) [UKF Release] ↳ Download/Stream ...",
                "videoId": "8eJJmVU4i4s"
            }
        },
        {
            "sourceSong": {
                "title": "Gunfinger (Salute)",
                "artists": [
                    "IRAH",
                    "Chase & Status"
                ],
                "videoId": "spotify:track:30aEleGsSvwoORcXA4mKgT"
            },
            "targetSong": {
                "title": "IRAH - Gunfinger (Salute) ft. Chase &amp; Status (Visualiser)",
                "artists": [
                    "IRAH"
                ],
                "description": "The official Visualiser for Gunfinger (Salute) Stream Gunfinger (Salute) here: https://lnk.to/IRAH-Gunfinger Listen to the music of ...",
                "videoId": "ZbjFZxdCDU0"
            }
        },
        {
            "sourceSong": {
                "title": "Sientelo - Sota & Circadian Remix",
                "artists": [
                    "Mefjus",
                    "Camo & Krooked",
                    "SOTA",
                    "Circadian"
                ],
                "videoId": "spotify:track:2G1ePysdwwjtoxB0qSacjd"
            },
            "targetSong": {
                "title": "Mefjus &amp; Camo &amp; Krooked - Sientelo (Sota &amp; Circadian Remix) [UKF15 Release]",
                "artists": [
                    "UKF Drum & Bass"
                ],
                "description": "Mefjus & Camo & Krooked - Sientelo (Sota & Circadian Remix) [UKF15 Release] ↳ Download/Stream ...",
                "videoId": "ELzEjU7saX8"
            }
        },
        {
            "sourceSong": {
                "title": "Free",
                "artists": [
                    "Emz",
                    "Nasser UK",
                    "Valor"
                ],
                "videoId": "spotify:track:2C0IvokSio8N7UyHwuB638"
            },
            "targetSong": {
                "title": "Emz - Free (feat. Nasser &amp; Valor)",
                "artists": [
                    "Hospital Records"
                ],
                "description": "Buy or stream 'Free (feat. Nasser & Valor) here: https://emz.ffm.to/free.OYD Well in there in the ranks amongst Bristol's finest, MC ...",
                "videoId": "vh6tPkf5hMQ"
            }
        },
        {
            "sourceSong": {
                "title": "Bandz A Make Her Dance (feat. Lil' Wayne & 2 Chainz)",
                "artists": [
                    "Juicy J",
                    "Lil Wayne",
                    "2 Chainz"
                ],
                "videoId": "spotify:track:7EZPH9Px3gXlxD5KJDwtwc"
            },
            "targetSong": {
                "title": "Juicy J - Bandz A Make Her Dance (Official Video) ft. Lil&#39; Wayne, 2 Chainz",
                "artists": [
                    "TheJuicyJVEVO"
                ],
                "description": "Official Video for \\"Bandz A Make Her Dance ft. Lil Wayne & 2 Chainz\\" by Juicy J Listen to Juicy J: https://JuicyJ.lnk.to/listenID ...",
                "videoId": "AI0gk2KJeho"
            }
        },
        {
            "sourceSong": {
                "title": "Stampede",
                "artists": [
                    "Pola & Bryson",
                    "Jelani Blackman"
                ],
                "videoId": "spotify:track:13wc1JCW2FmxT1niR2LrXc"
            },
            "targetSong": {
                "title": "Pola &amp; Bryson, Jelani Blackman - Stampede",
                "artists": [
                    "Shogun Audio"
                ],
                "description": "Subscribe to Shogun Audio: https://lnk.to/YTSubscribe This is the Pola & Bryson & Jelani Blackman's 'Stampede' - Out Now: ...",
                "videoId": "4sPTv66bxvw"
            }
        }
    ],
    "uncertainProposedChanges": [
            {
            "sourceSong": {
                "title": "BADDERS",
                "artists": [
                    "PEEKABOO",
                    "Flowdan",
                    "Skrillex",
                    "G-REX"
                ],
                "videoId": "spotify:track:4zbInBD4rY7tYPJ16LVxdh"
            },
            "targetSong": {
                "title": "Skrillex, PEEKABOO, Flowdan, &amp; G-Rex - Badders (Official Audio)",
                "artists": [
                    "Skrillex"
                ],
                "description": "Skrillex, PEEKABOO, Flowdan, & G-Rex - Badders (Official Audio) Listen Now - https://skrillex.lnk.to/baddersID Subscribe for more ...",
                "videoId": "YfpV3al_Q3k"
            }
        },
        {
            "sourceSong": {
                "title": "Holidae In",
                "artists": [
                    "Chingy",
                    "Ludacris",
                    "Snoop Dogg"
                ],
                "videoId": "spotify:track:5ACG7ngZo2Gq2O0clHBTMl"
            },
            "targetSong": {
                "title": "Chingy, Ludacris, Snoop Dogg - Holidae In (Official Music Video)",
                "artists": [
                    "ChingyVEVO"
                ],
                "description": "REMASTERED IN HD! Official video of Chingy Featuring Ludacris And Snoop Dogg performing Holidae In from the album ...",
                "videoId": "GmKjTC8yDFM"
            }
        }
    ],
    "requestDetails": {
        "sourceUser": "justin",
        "targetUser": "justin",
        "sourceService": "spotify",
        "targetService": "youtube",
        "playlist": "test"
    }
}
`