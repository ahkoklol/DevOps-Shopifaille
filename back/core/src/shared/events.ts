import { Kafka, logLevel } from 'kafkajs';
import { env } from '../config/env.ts';

const kafka = new Kafka({ clientId: env.serviceName, brokers: env.kafkaBrokers, logLevel: logLevel.NOTHING });
const producer = kafka.producer();

export async function startEvents() { if (env.kafkaBrokers.length) await producer.connect(); }
export async function stopEvents() { try { await producer.disconnect(); } catch { /* noop */ } }

export async function publish(type: string, payload: unknown) {
  if (!env.kafkaBrokers.length) return; // pas de Kafka en dev local
  const topic = `core.${type}`; // ex: core.store.created
  await producer.send({ topic, messages: [{ key: type, value: JSON.stringify(payload) }] });
}
