export type EventName =
  | "store.created"
  | "store.updated"
  | "store.status.changed"
  | "store.plan.changed"
  | "domain.added"
  | "domain.verified"
  | "domain.primary.changed"
  | "theme.published"
  | "navigation.updated"
  | "pages.updated"
  | "settings.checkout.updated";

export interface EventPayload<T = unknown> {
  event: EventName;
  data: T;
  at: string; 
}
