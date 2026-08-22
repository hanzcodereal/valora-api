const axios = require('axios');

async function downloadWithNexray(url) {
    try {
        const response = await axios.get('https://api.nexray.eu.cc/downloader/aio', {
            params: { url: url },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
                'Accept': 'application/json'
            },
            timeout: 60000
        });

        if (!response.data) {
            throw new Error('Tidak ada data dari API');
        }

        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(`API Error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
        } else if (error.request) {
            throw new Error('Tidak ada response dari server');
        } else {
            throw new Error(`Error: ${error.message}`);
        }
    }
}

module.exports = function (app) {
    app.get('/', async (req, res) => {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                status: false,
                message: 'URL parameter required'
            });
        }

        try {
            const data = await downloadWithNexray(url);
            res.status(200).json({
                status: true,
                result: data
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
    });
                                                  }
