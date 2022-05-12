const moment = require('moment');

const debug = require('../utils/debug')('decode');
const segmentsSchema = require('../segments');
const decodeSegment = require('./decodeSegment');
const mkdir = require('../utils/mkdir');
const { PATH_EDIS_OUT } = process.env;

module.exports = async edi => {
  const folderName = moment().format('dddd, MMMM Do YYYY, hh-mm-ss a');
  const pathEdisOut = mkdir(PATH_EDIS_OUT, folderName);
  debug('%s', pathEdisOut);

  return edi.match(/.{1,80}/g).reduce((acc, segment) => {
    const match = segment.match(/^(((PE|PG)\d\d)|OI|A|B|Y|Z)/);
    if (match?.length) {
      // debug('%o', { segment, key });

      const [key] = match;
      decodeSegment(key, segment, segmentsSchema[key], pathEdisOut);
    }

    return acc;
  }, {});
};
