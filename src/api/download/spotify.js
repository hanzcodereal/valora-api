const axios = require('axios');

module.exports = (app) => {
    app.get('/download/spotify', async (req, res) => {
        const url = String(req.query.url || req.body.url || '').trim();

        if (!url) {
            return res.status(400).json({
                status: false,
                message: 'Parameter url diperlukan'
            });
        }

        try {
            const response = await axios.post(
                'https://musicfab.io/api/spotify',
                { url: url },
                {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36',
                        'Accept': '*/*',
                        'Content-Type': 'application/json',
                        'Origin': 'https://musicfab.io',
                        'Referer': 'https://musicfab.io/',
                        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
                    },
                    timeout: 30000
                }
            );

            const metadata = response.data?.data?.metadata;

            if (!metadata || !metadata.download) {
                return res.status(500).json({
                    status: false,
                    message: 'Gagal download'
                });
            }

            return res.json({
                status: true,
                input: url,
                download_url: metadata.download,
                metadata: {
                    name: metadata.name || null,
                    artist: metadata.artist || null,
                    album: metadata.album || null,
                    duration: metadata.duration || null,
                    image: metadata.image || null
                }
            });

        } catch (err) {
            return res.status(500).json({
                status: false,
                message: err.message
            });
        }
    });
};
