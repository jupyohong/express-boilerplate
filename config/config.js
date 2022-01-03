const REDIS_TTL = 60 * 60 * 24 * 3; // 3 days
const RESIZE_FOLDER = [];
const RESIZE_OPTION = [
  { name: 'w100', width: 100 },
  { name: 'w250', width: 250 },
  { name: 'w500', width: 500 },
];

module.exports = {
  REDIS_TTL,
  RESIZE_FOLDER,
  RESIZE_OPTION,
};
