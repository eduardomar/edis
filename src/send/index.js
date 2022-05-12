const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const send = require('../utils/send');
const mkdir = require('../utils/mkdir');
const debug = require('../utils/debug')('send');
const { PATH_EDIS_IN } = process.env;

module.exports = async () => {
  const pathEdisIn = mkdir(PATH_EDIS_IN);
  if (!pathEdisIn?.length) return;

  debug('Add the edis (txt) in the folder → %s', pathEdisIn);
  chokidar.watch(pathEdisIn, {}).on('add', async pathFile => {
    const debugExample = debug.extend(path.basename(pathFile));
    const text = fs.readFileSync(pathFile, { encoding: 'utf-8' });

    debugExample('Sending...');
    // text.match(/.{1,80}/g).map(str => str.padEnd(80, ' '));
    await send(text);
    debugExample('SEND!');

    debugExample('Deleting file...');
    fs.unlinkSync(pathFile);
    debugExample('DELETED!');
  });
};
