const moment = require('moment');
const fs = require('fs');

const debug = require('../utils/debug')('decode');
const segmentsSchema = require('../segments');
const decodeSegment = require('./decodeSegment');
const mkdir = require('../utils/mkdir');
const exists = require('../utils/exists');
const { PATH_EDIS_OUT } = process.env;

const tryParseObj = edi => {
  try {
    return JSON.parse(edi);
  } catch {
    return edi;
  }
};

module.exports = async ediFromQueue => {
  try {
    const suggestedFolderName = moment().format(
      'dddd, MMMM Do YYYY, hh-mm-ss a',
    );
    const edi = tryParseObj(ediFromQueue);
    let bag = { path: null };
    if (edi === ediFromQueue) {
      bag.folderName = suggestedFolderName;
      bag.edi = edi;
    } else if (Object.keys(edi ?? {})?.length) {
      bag.folderName = edi.name ?? suggestedFolderName;
      bag.edi = edi.raw ?? null;
    } else {
      throw Error('Impossible to translate the edi');
    }

    let tree = [PATH_EDIS_OUT, bag.folderName];
    let index = 1;
    while (exists(...tree)) {
      // debug('Exists %o', { tree });
      tree = [PATH_EDIS_OUT, `${bag.folderName} (${index++})`];
    }

    bag.path = mkdir(...tree);
    const segments = bag.edi.match(/.{1,80}/g).reduce((acc, segment) => {
      const match = segment.match(/^(((PE|PG)\d\d)|OI|A|B|Y|Z)/);

      if (match?.length) {
        const [key] = match;
        acc[key] = acc[key] ?? { segments: [], schema: segmentsSchema[key] };
        acc[key].segments.push(segment);
      }

      return acc;
    }, {});

    await Promise.all(
      Object.entries(segments).map(async ([key, { segments, schema }]) => {
        const getKey = i => (segments?.length > 1 ? `${key} (${i + 1})` : key);

        return Promise.all(
          segments.map(async (segment, index) =>
            decodeSegment(segment, schema, getKey(index), bag.path),
          ),
        );
      }),
    );
  } catch (error) {
    debug('%s', error?.message);
    throw error;
  }
};
