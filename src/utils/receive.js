const rabbit = require('./rabbit');
const debug = require('./debug')('rabbit', 'receive');
const error = debug.extend('error');

const exchange = process.env.RABBIT_EXCHANGES;
const queue = process.env.RABBIT_QUEUE_IN;
const routingKey = process.env.RABBIT_ROUTING_KEY_IN;

module.exports = async cb => {
  const { channel } = await rabbit(exchange);
  try {
    const q = await channel.assertQueue(queue, { durable: true });
    channel.prefetch(1);
    channel.bindQueue(q.queue, exchange, routingKey);
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
