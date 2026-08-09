const axios = require('axios');

module.exports = (app) => {
    app.get('/canvas/reminder', async (req, res) => {
        const text = req.query.text || req.body.text;
        const author = req.query.author || req.body.author;

        if (!text) {
            return res.status(400).json({
                status: false,
                message: "Parameter 'text' wajib diisi."
            });
        }

        if (!author) {
            return res.status(400).json({
                status: false,
                message: "Parameter 'author' wajib diisi."
            });
        }

        try {
            const apiKey = 'kyzz56780526';
            const url = `https://api.kyzzz.eu.cc/api/canvas/reminder?text=${encodeURIComponent(text)}&author=${encodeURIComponent(author)}&apikey=${apiKey}`;

            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'image/*,*/*;q=0.8',
                    'Connection': 'keep-alive'
                }
            });

            const contentType = response.headers['content-type'] || 'image/png';
            res.set('Content-Type', contentType);
            res.send(response.data);
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message || "Terjadi kesalahan saat membuat Reminder image"
            });
        }
    });
};
