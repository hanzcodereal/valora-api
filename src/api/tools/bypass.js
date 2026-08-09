const axios = require('axios');

module.exports = (app) => {
    app.get('/tools/bypass', async (req, res) => {
        const url = String(req.query.url || req.body.url || '').trim();

        if (!url) {
            return res.status(400).json({
                status: false,
                message: 'Parameter url diperlukan'
            });
        }

        try {
            const tokenRes = await axios.get('https://bypass-links.com/api/token', {
                headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36' }
            });

            const token = tokenRes.data.token;

            const bypassRes = await axios.post('https://bypass-links.com/api/bypass', {
                url,
                bypass_token: token
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
                }
            });

            return res.json({
                status: true,
                result: bypassRes.data
            });

        } catch (err) {
            return res.status(500).json({
                status: false,
                message: err.message
            });
        }
    });
};
