/**
 * Verifies Redis connectivity (DNS, TLS, auth) before starting the API.
 * Usage: node scripts/test-redis.js
 * Exit 0 = PING ok, 1 = failure
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('redis');

function normalizeRedisUrl(url) {
    if (!url || typeof url !== 'string') return '';
    return url.trim().replace(/^["']|["']$/g, '');
}

async function main() {
    const url = normalizeRedisUrl(process.env.REDIS_URL);
    if (!url) {
        console.error('FAIL: REDIS_URL is missing in meditrack-backend/.env');
        process.exit(1);
    }

    const masked = url.replace(/:([^@/@]+)@/, ':***@');
    console.log('Connecting with:', masked);

    const client = createClient({ url });
    client.on('error', (err) => {
        console.error('Client error:', err.message);
    });

    try {
        await client.connect();
        const pong = await client.ping();
        console.log('OK: PING ->', pong);
        await client.quit();
        process.exit(0);
    } catch (err) {
        console.error('FAIL:', err.message);
        if (err.message.includes('ENOTFOUND')) {
            console.error('Hint: DNS could not resolve the Redis host. Open Upstash, confirm the database exists, and paste the current Redis URL (rediss://...).');
        }
        if (err.message.includes('WRONGPASS') || err.message.includes('auth')) {
            console.error('Hint: Password in REDIS_URL may be wrong — reset credentials in Upstash.');
        }
        try {
            await client.quit();
        } catch (_) {
            /* ignore */
        }
        process.exit(1);
    }
}

main();
