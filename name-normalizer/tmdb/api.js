export class TvService {
    accessToken;
    tvShowId;

    constructor(accessToken) {
        this.accessToken = accessToken;
    }

    async setTvSeries(tvshowName, year) {
        const baseUrl = 'https://api.themoviedb.org/3/search/tv';
        const params = new URLSearchParams({
            query: tvshowName,
            include_adult: 'false',
            language: 'en-US',
            page: '1',
            ...(year && {year})
        });
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${this.accessToken}`
            }
        };
        
        let res = await fetch(`${baseUrl}?${params.toString()}`, options);
        res = await res.json();
        this.tvShowId = res.results[0].id
    }

    async getTvSeasonEpisodes(seasonNumber) {
        if (!this.tvShowId) {
            console.log("You must set the tvshow before trying to find episodes.");
            return;
        }
        const url = `https://api.themoviedb.org/3/tv/${this.tvShowId}/season/${seasonNumber}?language=en-US`;
        const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${this.accessToken}`
        }
        };
    
        let res = await fetch(url, options)
        res = await res.json();
        let result = []
        try {
            res.episodes.map(episode => {result[episode.episode_number-1]=episode.name})
        } catch (err) {
            throw new Error(`
                There was an error with loading the episodes from the specified season: [${!seasonNumber ? "MISSING" : seasonNumber}]
                \nPlease make sure you have the seasons in the show directory in the following format:
                \nSeason xx (year_released)
                \nHere is the result of the fetch call: ${JSON.stringify(res)}
                \n`, err);
        }
        return result
    }
}