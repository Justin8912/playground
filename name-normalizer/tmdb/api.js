export class TvService {
    accessToken;

    constructor(accessToken) {
     this.accessToken = accessToken;
    }

    async getTvSeriesId(tvshowName, year) {
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
        return res.results[0].id;
    }

    async getTvSeasonEpisodes(seriesId, seasonNumber) {
        const url = `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?language=en-US`;
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
        res.episodes.map(episode => {result[episode.episode_number-1]=episode.name})
        return result
    }
}