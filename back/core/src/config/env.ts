export const env = {
  PORT: Number(Deno.env.get("PORT") ?? 7000),
  PG_URL: Deno.env.get("PG_URL") ??
    "postgres://user:password@localhost:5432/core",
  httpPort: Number(process.env.PORT ?? 8080),
  grpcPort: Number(process.env.GRPC_PORT ?? 50051),
  kafkaBrokers: (process.env.KAFKA_BROKERS ?? '').split(',').map(s => s.trim()).filter(Boolean),
  serviceName: process.env.SERVICE_NAME ?? 'store-management'
  webhookConcurrency: Number(process.env.WEBHOOK_CONCURRENCY ?? 5),
  kafkaGroup: process.env.KAFKA_GROUP ?? 'event-webhooks'
};
import 'dotenv/config';
