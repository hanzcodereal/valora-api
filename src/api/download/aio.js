const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const CONFIG = {
    baseUrl: 'https://downr.org',
    mintEndpoint: '/.netlify/functions/analytics',
    downloadEndpoint: '/.netlify/functions/bbc',
    userAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
};

const jar = new CookieJar();
const client = wrapper(axios.create({
    jar,
    withCredentials: true,
    headers: {
        'User-Agent': CONFIG.userAgent,
        'Accept': '*/*'
    }
}));

async function downloadVideo(targetUrl) {
    try {
        const mintRes = await client.get(`${CONFIG.baseUrl}${CONFIG.mintEndpoint}`, {
            timeout: 15000
        });

        if (mintRes.status !== 200) {
            throw new Error(`Gagal minting sesi. Status: ${mintRes.status}`);
        }

        const payload = { url: targetUrl };
        
        const res = await client.post(
            `${CONFIG.baseUrl}${CONFIG.downloadEndpoint}`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': CONFIG.baseUrl,
                    'Referer': `${CONFIG.baseUrl}/`
                },
                timeout: 60000
            }
        );

        if (!res.data || !res.data.url) {
             if (typeof res.data === 'string' && res.data.includes('retry')) {
                throw new Error('Masih kena user_retry_required. Cookie mungkin belum terpropagasi.');
            }
            throw new Error('Data video tidak ditemukan dalam respons.');
        }

        return res.data;

    } catch (err) {
        if (err.response?.status === 403 && err.response.data === 'user_retry_required') {
            console.error('\n[!] ERROR: user_retry_required');
            console.error('[!] Session minting gagal atau cookie tidak terbaca oleh server.');
        } else {
            console.error('[!] Error:', err.message);
        }
        process.exit(1);
    }
}

(async () => {
    const targetUrl = process.argv[2];
    if (!targetUrl) {
        console.log('❌ node downr.js <URL>');
        process.exit(1);
    }

    try {
        const data = await downloadVideo(targetUrl);
        console.log('\n✅ SUKSES:\n', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Gagal:', e.message);
    }
})();
