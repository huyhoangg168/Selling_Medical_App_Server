const Redis = require('ioredis');

const connectionString = process.env.REDIS_PUBLIC_URL;

const redisClient = new Redis(connectionString);

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected Successfully'));

module.exports = redisClient;