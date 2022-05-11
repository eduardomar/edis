require('dotenv').config();

const debug = require('./utils/debug')();
const receive = require('./utils/receive');

debug('Init');

(async () => {
  await Promise.all([
    receive('EDIS_IN_DOCS', 'edis.inbound', async edi => {
      debug('EDIS_IN_DOCS', { edi });
    }),

    // receive('EDIS_OUT_DOCS', 'edis.outbound', async edi => {
    //   debug('EDIS_OUT_DOCS', 'edis.outbound', { edi });
    // }),
  ]);
})();
