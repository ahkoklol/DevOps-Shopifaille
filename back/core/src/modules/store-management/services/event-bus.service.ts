import { EventName, EventPayload } from "../events.type.ts";

export class EventBusService {
  async publish<T>(event: EventName, data: T) : Promise<EventPayload<T>> {
    const payload: EventPayload<T> = { event, data, at: new Date().toISOString() };
    console.log("[event]", JSON.stringify(payload)); // Replace with Kafka producer later
    return payload;
  }
}
