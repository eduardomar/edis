const rabbit = require('./rabbit');
const debug = require('./debug')('rabbit', 'receive');
const error = debug.extend('error');

module.exports = async (queue, routingKey, cb) => {
  const { channel } = await rabbit('EDIS');
  try {
    const q = await channel.assertQueue(queue, { durable: true });
    channel.prefetch(1);
    channel.bindQueue(q.queue, 'EDIS', routingKey);
    channel.consume(
      q.queue,
      async msg => {
        try {
          if (!msg?.content?.toString) throw Error('Message incorrect');

          await cb?.(msg.content.toString());
          channel.ack(msg);
        } catch (err) {
          error('%o', err);
          channel.nack(msg);
        }
      },
      { noAck: false },
    );
  } catch (err) {
    error('%o', err);
  }
};
