import { ClientProviderOptions, Transport } from '@nestjs/microservices';

export const rabbitClient = (name: string, queue: string): ClientProviderOptions => ({
  name,
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL ?? 'amqp://ecommerce:ecommerce_password@rabbitmq:5672'],
    queue,
    queueOptions: { durable: true },
    persistent: true,
    noAck: false,
  },
});
