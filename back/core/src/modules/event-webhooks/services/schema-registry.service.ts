// Simple stub for schema validation. Replace with real registry.
export class SchemaRegistryService {
  // Ensures topic with version appears valid.
  validateTopicVersion(topicVersion: string) {
    // e.g. "order.created@v1"
    return /.+@v\d+$/.test(topicVersion);
  }

  // No-op JSON validation (always true). Replace with Ajv if needed.
  validatePayload(_type: string, _data: unknown): boolean {
    return true;
  }

  listTopics() {
    return [
      { type: "order.created@v1", summary: "Order created event" },
      { type: "order.status.updated@v1", summary: "Order status changed" },
      { type: "order.refunded@v1", summary: "Order refund event" },
      { type: "theme.published@v1", summary: "Theme published" },
    ];
  }
}
