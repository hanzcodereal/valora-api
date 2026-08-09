const axios = require('axios');

module.exports = (app) => {
    app.get('/tools/shorturl-tinyurl', async (req, res) => {
        const url = req.query.url || req.body.url;

        if (!url) {
            return res.status(400).json({
                status: false,
                error: 'Parameter URL wajib diisi.'
            });
        }

        try {
            if (!url.match(/^https?:\/\//)) {
                url = 'https://' + url;
            }

            const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, {
                timeout: 5000
            });

            if (response.data === 'Error') {
                throw new Error('URL tidak valid.');
            }

            return res.status(200).json({
                status: true,
                result: response.data
            });

        } catch (error) {
            return res.status(500).json({
                status: false,
                error: error.message
            });
        }
    });
};
