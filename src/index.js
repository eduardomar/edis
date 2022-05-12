require('dotenv').config();

const debug = require('./utils/debug')();
const decode = require('./decode');
const send = require('./send');
const receive = require('./utils/receive');
const mkdir = require('./utils/mkdir');

debug('Init');
const { TYPE, PATH_EDIS_IN, PATH_EDIS_OUT } = process.env;

[PATH_EDIS_IN, PATH_EDIS_OUT].forEach(mkdir);

(async () => {
  if (TYPE === 'TRANSLATOR') {
    await receive(async edi => {
      debug('Dispatching EDI...');
      await decode(edi);
      debug('Finish him off! ☠');
    });
  } else if (TYPE === 'SENDER') {
    await send();
  }
})();
