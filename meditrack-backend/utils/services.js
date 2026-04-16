const { createClient } = require('redis');
const nodemailer = require('nodemailer');

/** Strip whitespace and wrapping quotes often accidentally added in .env files */
function normalizeRedisUrl(url) {
    if (!url || typeof url !== 'string') return '';
    return url.trim().replace(/^["']|["']$/g, '');
}

const REDIS_URL = normalizeRedisUrl(process.env.REDIS_URL);
const REDIS_OPTIONAL = process.env.REDIS_OPTIONAL === 'true';

const memoryCache = new Map();

const noopRedis = {
    isOpen: true, // Pretend it's open
    isMock: true,
    connect: async () => {},
    on: () => {},
    get: async (key) => memoryCache.get(key) || null,
    setEx: async (key, seconds, value) => {
        memoryCache.set(key, value);
        // Basic TTL implementation
        setTimeout(() => memoryCache.delete(key), seconds * 1000);
        return 'OK';
    },
    del: async (key) => memoryCache.delete(key),
    quit: async () => memoryCache.clear(),
    disconnect: async () => memoryCache.clear()
};

let redisClient = noopRedis;

if (REDIS_URL) {
    redisClient = createClient({
        url: REDIS_URL,
        socket: {
            reconnectStrategy(retries) {
                if (retries > 10) {
                    console.error('❌ Redis: stopping reconnect after 10 attempts. Fix REDIS_URL or DNS (ENOTFOUND = wrong host or deleted Upstash DB).');
                    return false;
                }
                return Math.min(retries * 500, 4000);
            }
        }
    });

    let lastRedisError = '';
    redisClient.on('error', (err) => {
        if (err.message !== lastRedisError) {
            lastRedisError = err.message;
            console.error('❌ Redis:', err.message);
        }
    });

    const connectRedis = async () => {
        try {
            if (!redisClient.isOpen) {
                await redisClient.connect();
            }
            console.log('✅ Redis connected');
        } catch (err) {
            console.error('❌ Redis connection failed:', err.message);
            console.warn('⚠️ Falling back to Local Memory Cache (Free Version).');
            redisClient = noopRedis; // Fall back to memory mock
        }
    };

    connectRedis();
} else {
    console.warn(REDIS_OPTIONAL
        ? '⚠️ Redis skipped (no REDIS_URL). OTP password reset will be unavailable.'
        : '⚠️ REDIS_URL is not set. OTP password reset will be unavailable. Set REDIS_URL or REDIS_OPTIONAL=true.');
}

const isRedisReady = () => redisClient && redisClient.isOpen === true;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

module.exports = { redisClient, transporter, isRedisReady };
