import { Kafka, logLevel } from 'kafkajs';
import { env } from '../../../config/env';
import { WebhookService } from './webhook.service';

let started = false;

export async function startWebhookDispatcher() {
  if (started) return;
  started = true;

  if (!env.kafkaBrokers.length) {
    console.warn('[webhooks] Kafka brokers not set – dispatcher disabled');
    return;
  }

  const kafka = new Kafka({ clientId: `${env.serviceName}-webhooks`, brokers: env.kafkaBrokers, logLevel: logLevel.NOTHING });
  const consumer = kafka.consumer({ groupId: env.kafkaGroup });

  await consumer.connect();
  // RegExp supporté par kafkajs -> écoute tous les topics qui commencent par core.
  await consumer.subscribe({ topic: /^core\./, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const type = (message.key?.toString() || '').replace('core.', '');
      const payloadStr = message.value?.toString() ?? '{}';
      const payload = safeJSON(payloadStr);

      // Exemple: topic "core.order.created" -> type "order.created"
      const eventType = topic.replace('core.', '');
      await WebhookService.fanout(eventType || type, payload);
    }
  });

  console.log('[webhooks] dispatcher running (Kafka topics /^core\\./)');
}

function safeJSON(s: string) {
  try { return JSON.parse(s); } catch { return { raw: s }; }
}
