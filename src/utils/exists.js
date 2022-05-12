const path = require('path');
const fs = require('fs');

module.exports = (...dirs) => {
  if (!dirs?.length || dirs.some(dir => !dir?.length)) return false;

  const pathDir = path.join(...dirs);
  return fs.existsSync(pathDir);
};
