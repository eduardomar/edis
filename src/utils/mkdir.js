const path = require('path');
const fs = require('fs');

module.exports = (...dirs) => {
  if (!dirs?.length || dirs.some(dir => !dir?.length)) return;

  const pathDir = path.join(...dirs);
  if (!fs.existsSync(pathDir)) {
    fs.mkdirSync(pathDir, { recursive: true });
  }

  return pathDir;
};
