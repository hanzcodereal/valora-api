const axios = require('axios');

module.exports = (app) => {
    app.get('/canvas/iqc-pink', async (req, res) => {
        const text = req.query.text || req.body.text;
        const time = req.query.time || req.body.time || '';

        if (!text) {
            return res.status(400).json({
                status: false,
                message: "Parameter 'text' diperlukan."
            });
        }

        try {
            const apiKey = 'kyzz56780526';
            const url = `https://api.kyzzz.eu.cc/api/canvas/iqc-pink?text=${encodeURIComponent(text)}&time=${encodeURIComponent(time)}&apikey=${apiKey}`;

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
                message: error.message || "Terjadi kesalahan saat membuat IQC Pink image"
            });
        }
    });
};
