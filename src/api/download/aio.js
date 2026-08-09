const axios = require('axios');

async function scrapeDownloader(targetUrl) {
    const endpoint = 'https://dl.valore.web.id/api/download';

    const headers = {
        'accept': '*/*',
        'accept-language': 'id-ID,id;q=0.9',
        'content-type': 'application/json',
        'dnt': '1',
        'origin': 'https://dl.valore.web.id',
        'priority': 'u=1, i',
        'referer': 'https://dl.valore.web.id/',
        'sec-ch-ua': '"Quetta";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'sec-gpc': '1',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
        'x-session-id': 'sid_7v86ft4rb94msd82gdb'
    };

    const payload = {
        url: targetUrl
    };

    const response = await axios.post(endpoint, payload, { headers });
    return response.data;
}

module.exports = (app) => {
    app.get('/download/aio', async (req, res) => {
        const url = String(req.query.url || req.body.url || '').trim();

        if (!url) {
            return res.status(400).json({
                status: false,
                message: 'Parameter url diperlukan'
            });
        }

        try {
            const result = await scrapeDownloader(url);
            return res.json({
                status: true,
                result
            });
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: err.response?.data ? JSON.stringify(err.response.data).slice(0, 500) : err.message
            });
        }
    });
};
