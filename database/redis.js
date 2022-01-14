const { createClient } = require('redis');

const client = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASS,
});

client.on('error', err => console.error('Redis client error', err));

// Get the value of a key
const get = async key => {
  try {
    await client.connect();
    const value = await client.get(key);
    return value;
  } catch (err) {
    throw new Error('REDIS_ERROR');
  } finally {
    await client.quit();
  }
};

// Set the value and expiration of a key
const setEx = async (key, seconds, value) => {
  try {
    if (typeof value === 'string' || value instanceof String) {
      await client.connect();
      await client.setEx(key, seconds, value);
    } else {
      throw new Error('INVALID_TYPE');
    }
  } catch (err) {
    throw new Error('REDIS_ERROR');
  } finally {
    await client.quit();
  }
};

// Delete a key
const del = async key => {
  try {
    await client.connect();
    await client.del(key);
  } catch (err) {
    throw new Error('REDIS_ERROR');
  } finally {
    await client.quit();
  }
};

module.exports = { get, setEx, del };
