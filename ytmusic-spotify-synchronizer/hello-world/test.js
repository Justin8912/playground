import puppeteer from 'puppeteer';

async function scrapeYouTubeVideo(videoId) {
    // Configure puppeteer for both local and Docker environments
    const launchOptions = {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    };
    
    // Use environment variable for executable path if available (used in Docker)
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        console.log(`Using Chrome at: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
        launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    
    console.log(`Navigating to: ${url}`);
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        const data = await page.evaluate(() => {
            const titleElement = document.querySelector('.yt-video-attribute-view-model__title');
            const artistElement = document.querySelector('.yt-video-attribute-view-model__subtitle');

            const title = titleElement ? titleElement.innerText : 'Title not found';
            const artists = artistElement ? artistElement.innerText : 'Artists not found';

            return { title, artists };
        });

        console.log(`Title: ${data.title}`);
        console.log(`Artists: ${data.artists}`);

        await browser.close();
    } catch (error) {
        console.error(`Error scraping video ${videoId}: ${error.message}`);
        await browser.close();
    }
}

// Example usage
const videoId = 'DJoPdsGMbH8';
scrapeYouTubeVideo(videoId);
