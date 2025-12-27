const Redis = require('ioredis');

// Copy nguyên chuỗi REDIS_PUBLIC_URL vào đây
// Ví dụ: 'redis://default:pxuLOPBWUchwIBzowRDsTSGmBvjwixbm@yamabiko.proxy.rlwy.net:20250'
const connectionString = process.env.REDIS_PUBLIC_URL || 'redis://default:pxuLOPBWUchwIBzowRDsTSGmBvjwixbm@yamabiko.proxy.rlwy.net:20250';

const redisClient = new Redis(connectionString);

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected Successfully'));

module.exports = redisClient;