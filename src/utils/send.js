const rabbit = require('./rabbit');
const debug = require('./debug')('rabbit', 'receive');
const error = debug.extend('error');

const exchange = process.env.RABBIT_EXCHANGES;
const routingKey = process.env.RABBIT_ROUTING_KEY_IN;

module.exports = async data => {
  const { channel } = await rabbit(exchange);

  return await channel.publish(exchange, routingKey, Buffer.from(data), {
    persistent: true,
  });
};
