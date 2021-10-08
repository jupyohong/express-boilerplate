const Redis = require('redis');
const { promisify } = require('util');

const redis = Redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASS,
});

redis.getAsync = promisify(redis.get).bind(redis);
redis.hgetAsync = promisify(redis.hget).bind(redis);
redis.setexAsync = promisify(redis.setex).bind(redis);
redis.existsAsync = promisify(redis.exists).bind(redis);
redis.delAsync = promisify(redis.del).bind(redis);

module.exports = redis;
