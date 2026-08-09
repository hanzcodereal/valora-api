const axios = require('axios');

module.exports = (app) => {
    app.get('/canvas/iqc', async (req, res) => {
        const text = req.query.text || req.body.text;
        const provider = req.query.provider || req.body.provider;
        const jam = req.query.jam || req.body.jam;
        const baterai = req.query.baterai || req.body.baterai;

        if (!text) {
            return res.status(400).json({
                status: false,
                message: "Parameter 'text' wajib diisi."
            });
        }

        if (!provider) {
            return res.status(400).json({
                status: false,
                message: "Parameter 'provider' wajib diisi."
            });
        }

        if (!jam) {
            return res.status(400).json({
                status: false,
                message: "Parameter 'jam' wajib diisi."
            });
        }

        if (!baterai) {
            return res.status(400).json({
                status: false,
                message: "Parameter 'baterai' wajib diisi."
            });
        }

        try {
            const url = `https://api.nexray.eu.cc/maker/v1/iqc?text=${encodeURIComponent(text)}&provider=${encodeURIComponent(provider)}&jam=${encodeURIComponent(jam)}&baterai=${encodeURIComponent(baterai)}`;

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
                message: error.message || "Terjadi kesalahan saat membuat IQC image"
            });
        }
    });
};
