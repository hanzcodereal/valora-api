const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

require("./function.js");

const app = express();
const PORT = process.env.PORT || 8080;

function queueLog({ method, status, url, duration, error = null }) {
    let colorFn;
    if (status >= 500) colorFn = chalk.red;
    else if (status >= 400) colorFn = chalk.red;
    else if (status === 304) colorFn = chalk.blue;
    else colorFn = chalk.green;

    console.log(colorFn(`[${method}] ${status} ${url} - ${duration}ms`));

    if (error) {
        console.log(chalk.red(`[ERROR] ${error.message || error}`));
    }
}
const requestCounts = new Map();
const cooldownIps = new Map();

setInterval(() => {
    requestCounts.clear();
}, 1000);

app.use((req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const cooldownUntil = cooldownIps.get(clientIp);

    if (cooldownUntil && Date.now() < cooldownUntil) {
        queueLog({
            method: req.method,
            status: 503,
            url: req.originalUrl,
            duration: 0,
            error: 'Client is in cooldown'
        });
        return res.status(503).json({ error: 'Too many requests, try again later.' });
    }
    if (cooldownUntil) {
        cooldownIps.delete(clientIp);
    }

    const currentCount = (requestCounts.get(clientIp) || 0) + 1;
    requestCounts.set(clientIp, currentCount);

    if (currentCount > 10) {
        const cooldownMs = Math.random() * (120000 - 60000) + 60000;
        cooldownIps.set(clientIp, Date.now() + cooldownMs);

        console.log(`⚠️ SPAM DETECT (${clientIp}): Cooldown ${(cooldownMs / 1000).toFixed(1)} detik`);

        return res.status(503).json({ error: 'Too many requests, try again later.' });
    }

    next();
});

app.enable("trust proxy");
app.set("json spaces", 2);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const settingsPath = path.join(__dirname, './assets/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
global.apikey = settings.apiSettings.apikey;

app.use((req, res, next) => {
    console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Request Route: ${req.path} `));
    global.totalreq += 1;

    const start = Date.now();
    const originalJson = res.json;

    res.json = function (data) {
        if (data && typeof data === 'object') {
            const responseData = {
                status: data.status,
                creator: settings.apiSettings.creator || "hanz",
                ...data
            };
            return originalJson.call(this, responseData);
        }
        return originalJson.call(this, data);
    };

    res.on('finish', () => {
        const duration = Date.now() - start;

        queueLog({
            method: req.method,
            status: res.statusCode,
            url: req.originalUrl,
            duration
        });
    });

    next();
});

app.use('/', express.static(path.join(__dirname, 'api-page')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use('/src', (req, res) => {
    res.status(403).json({ error: 'Forbidden access' });
});

let totalRoutes = 0;
const apiFolder = path.join(__dirname, './src/api');
fs.readdirSync(apiFolder).forEach((subfolder) => {
    const subfolderPath = path.join(apiFolder, subfolder);
    if (fs.statSync(subfolderPath).isDirectory()) {
        fs.readdirSync(subfolderPath).forEach((file) => {
            const filePath = path.join(subfolderPath, file);
            if (path.extname(file) === '.js') {
                try {
                    const route = require(filePath);
                    if (typeof route === 'function') {
                        route(app);
                        totalRoutes++;
                        console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Loaded Route: ${path.basename(file)} `));
                    } else {
                        console.log(chalk.bgHex('#FF6961').hex('#333').bold(` Skipped Route: ${path.basename(file)} (invalid export) `));
                    }
                } catch (err) {
                    console.log(chalk.bgHex('#FF6961').hex('#333').bold(` Failed to load Route: ${path.basename(file)} - ${err.message} `));
                }
            }
        });
    }
});

console.log(chalk.bgHex('#90EE90').hex('#333').bold(' Load Complete! ✓ '));
console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Total Routes Loaded: ${totalRoutes} `));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});

app.use((req, res, next) => {
    queueLog({
        method: req.method,
        status: 404,
        url: req.originalUrl,
        duration: 0,
        error: 'Not Found'
    });

    res.status(404).sendFile(process.cwd() + "/api-page/404.html");
});

app.use((err, req, res, next) => {
    console.error(err.stack);

    queueLog({
        method: req.method,
        status: 500,
        url: req.originalUrl,
        duration: 0,
        error: err
    });

    res.status(500).sendFile(process.cwd() + "/api-page/500.html");
});

app.listen(PORT, () => {
    console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Server is running on port ${PORT} `));
});

module.exports = app;
