const fs = require('fs');
const path = require('path');

const debug = require('../utils/debug')('decode-schema');
const ext = 'txt';
const markMissing = 'ˣ';

const orderSchema = schema => schema.sort(({ sec: a }, { sec: b }) => a - b);
const getMaxLengthName = schema =>
  Math.max(...schema.map(({ name }) => name.length));

const createMarks = (seqScheme, maxLength = 80) =>
  seqScheme
    // .map(({ max }) => '↑'.padEnd(max, ' '));
    .flatMap(({ start, end, max }, index, arr) => {
      const point = '↑'.padEnd(max, ' ');
      if (index === 0 && start > 1)
        return [''.padEnd(start - 1, markMissing), point];

      const prev = arr?.[index - 1];
      if (prev && prev.end < start - 1) {
        const spaces = start - prev.end - 1;
        return [''.padEnd(spaces, markMissing), point];
      }

      if (index === arr.length - 1 && end < maxLength)
        return [point, ''.padEnd(maxLength - end, markMissing)];

      return point;
    });

const translateSegment = (segment, schema) => {
  const seqScheme = orderSchema(schema);
  const marks = createMarks(seqScheme);
  const maxLengthName = getMaxLengthName(seqScheme);

  let missingSpaces = 0;
  const output = marks.reverse().reduce(
    (acc, point, index, arrPoints) => {
      const currentPoints = arrPoints.slice(index).reverse().join(''); // current pointer
      if (point.includes(markMissing)) {
        if (index === 0) acc.push(currentPoints);

        missingSpaces++;
        return acc;
      }

      const { name, sec, status, start, end, filler, align, max, description } =
        seqScheme[seqScheme.length - 1 - index + missingSpaces];

      const value = segment.substring(start - 1, end); // Value in the segment
      const length = segment.length + 1; // Segment length
      const signalPoint = point.replace('↑', '↳'); // Element pointer
      const others = arrPoints
        .slice(index + 1)
        .reverse()
        .join('');

      const line = `${others}${signalPoint}`
        .trim()
        .padEnd(length, '→')
        .replaceAll(markMissing, ' ');

      acc.push(currentPoints.replaceAll(index === 0 ? ' ' : markMissing, ' '));
      acc.push(`${line} ${name.padEnd(maxLengthName, ' ')} → '${value}'`);

      return acc;
    },
    [segment],
  );

  return [
    ...output,
    null,
    ...seqScheme.map(
      ({ name, description }) =>
        `${name}${description?.length ? `:\n\t${description}\n` : ''}`,
    ),
  ];
};

const writeFile = (dir, fileName, data) => {
  if (dir?.length && fileName?.length && data && fs.existsSync(dir)) {
    let pathSegment;
    let i = 0;

    do {
      pathSegment = path.join(
        dir,
        `${fileName}${i === 0 ? '' : ` (${i})`}.${ext}`,
      );
      i += 1;
    } while (fs.existsSync(pathSegment));
    fs.writeFileSync(pathSegment, data, { encoding: 'utf-8' });
  }
};

module.exports = (key, segment, schema, dir) => {
  if (segment?.length && schema?.length) {
    const output = translateSegment(segment, schema);

    writeFile(dir, `Segment ${key ?? 'S\\K'}`, output.join('\n'));
  } else {
    debug('%o', { segment, schema: !!schema });
  }
};
