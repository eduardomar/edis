const amqp = require('amqplib');
const debug = require('./debug')('AMQP');
const error = debug.extend('error');

const rabbitUser = process?.env?.RABBIT_USER ?? null;
const rabbitPassword = process?.env?.RABBIT_PASSWORD ?? null;
const rabbitHost = process?.env?.RABBIT_HOST ?? null;

const createConnection = async () => {
  if (!rabbitUser?.length || !rabbitPassword?.length || !rabbitHost?.length)
    return;

  try {
    const connection = await amqp.connect(
      `amqp://${rabbitUser}:${rabbitPassword}@${rabbitHost}`,
    );
    debug('Connected');

    connection.on('error', () => {
      error('[AMQP] reconnecting');
      connection.close();

      return setTimeout(() => {
        createConnection();
      }, 1000);
    });

    connection.on('close', () => {
      error('[AMQP] reconnecting');

      return setTimeout(() => {
        createConnection();
      }, 1000);
    });

    return connection;
  } catch (err) {
    return setTimeout(() => {
      debug('[AMQP] Reintent');
      createConnection();
    }, 1000);
  }
};

module.exports = async exchange => {
  const connection = await createConnection();
  if (!connection) return {};

  const channel = await connection.createChannel?.();
  if (!channel) return {};

  await channel.assertExchange(exchange, 'topic', {
    durable: true,
  });

  return {
    connection,
    channel,
  };
};
