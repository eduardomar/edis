const path = require('path');
const fs = require('fs');
const moment = require('moment');

const debug = require('../utils/debug')('decode');
const segmentsSchema = require('../segments');
const decodeSegment = require('./decodeSegment');

module.exports = async edi => {
  const folderName = moment().format('dddd, MMMM Do YYYY, hh-mm-ss a');
  const dirEdi = path.join(__dirname, '../../edis', folderName);
  fs.mkdirSync(dirEdi, { recursive: true });
  debug('%s', dirEdi);

  return edi.match(/.{1,80}/g).reduce((acc, segment) => {
    const match = segment.match(/^(((PE|PG)\d\d)|OI|A|B|Y|Z)/);
    if (match?.length) {
      // debug('%o', { segment, key });

      const [key] = match;
      decodeSegment(key, segment, segmentsSchema[key], dirEdi);
    }

    return acc;
  }, {});
};
