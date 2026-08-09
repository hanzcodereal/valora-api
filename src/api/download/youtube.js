const axios = require('axios');

const API_URL = 'https://api.vidssave.com/api/contentsite_api/media/parse';
const AUTH = '20250901majwlqo';
const DOMAIN = 'api-ak.vidssave.com';

function buildResources(mediaGroup) {
    return (mediaGroup.resources || [])
        .filter(r => r.download_url)
        .map(r => ({
            quality: r.quality,
            format: r.format,
            download_url: r.download_url,
            size: r.size,
            size_mb: r.size ? (r.size / (1024 * 1024)).toFixed(2) + ' MB' : null
        }))
        .sort((a, b) => (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0));
}

module.exports = (app) => {
    app.get('/download/youtube', async (req, res) => {
        const url = String(req.query.url || req.body.url || '').trim();
        const type = String(req.query.type || req.body.type || '').trim();
        const quality = String(req.query.quality || req.body.quality || '').trim();

        if (!url) {
            return res.status(400).json({
                status: false,
                message: 'Parameter url diperlukan'
            });
        }

        try {
            const cacheRes = await axios.post(API_URL,
                `auth=${AUTH}&domain=${DOMAIN}&origin=cache&link=${encodeURIComponent(url)}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
                    }
                }
            );

            let data = cacheRes.data;

            if (!data.data?.media || data.data.media.length === 0) {
                const sourceRes = await axios.post(API_URL,
                    `auth=${AUTH}&domain=${DOMAIN}&origin=source&link=${encodeURIComponent(url)}`,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
                        }
                    }
                );
                data = sourceRes.data;
            }

            if (!data.data?.media || data.data.media.length === 0) {
                throw new Error('Media tidak ditemukan');
            }

            // Bangun daftar pilihan untuk SEMUA tipe media (video, audio, dll) — seperti tampilan pilihan di API sumbernya.
            const choices = data.data.media
                .filter(m => m.resources && m.resources.length > 0)
                .map(m => ({
                    type: m.media_id,
                    label: m.media_name || m.media_id,
                    qualities: buildResources(m)
                }))
                .filter(m => m.qualities.length > 0);

            const baseInfo = {
                video_id: data.data.id,
                title: data.data.title,
                duration: data.data.duration + ' detik',
                thumbnail: data.data.media[0]?.thumbnail || data.data.thumbnail,
                channel: data.data.user_item?.nickname || ''
            };

            // Kalau user belum memilih type/quality, kembalikan semua pilihan (seperti menu pilihan di API aslinya).
            if (!type || !quality) {
                return res.json({
                    status: true,
                    result: {
                        ...baseInfo,
                        choices
                    }
                });
            }

            // Kalau type & quality sudah dipilih, langsung kembalikan link download yang sesuai.
            const mediaGroup = choices.find(c => c.type === type);

            if (!mediaGroup) {
                throw new Error(`Tipe ${type} tidak tersedia. Tipe yang tersedia: ${choices.map(c => c.type).join(', ')}`);
            }

            const selected = mediaGroup.qualities.find(r => r.quality === quality) || mediaGroup.qualities[0];

            return res.json({
                status: true,
                result: {
                    ...baseInfo,
                    type,
                    selected,
                    all_qualities: mediaGroup.qualities
                }
            });

        } catch (err) {
            const msg = err.response?.data ? JSON.stringify(err.response.data).slice(0, 500) : err.message;
            return res.status(500).json({
                status: false,
                message: msg
            });
        }
    });
};
