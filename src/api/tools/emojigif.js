const axios = require('axios');

module.exports = (app) => {
    app.get('/canvas/emojigif', async (req, res) => {
        const emoji = req.query.emoji || req.body.emoji;

        if (!emoji) {
            return res.status(400).json({
                status: false,
                message: "Parameter 'emoji' wajib diisi."
            });
        }

        try {
            const url = `https://api.nexray.eu.cc/tools/emojigif?emoji=${encodeURIComponent(emoji)}`;

            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'image/webp,image/gif,image/*,*/*;q=0.8',
                    'Connection': 'keep-alive'
                }
            });

            const contentType = response.headers['content-type'] || 'image/gif';
            res.set('Content-Type', contentType);
            res.send(response.data);
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message || "Terjadi kesalahan saat mengubah emoji menjadi GIF"
            });
        }
    });
};
