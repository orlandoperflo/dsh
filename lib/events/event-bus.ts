type EventHandler = (
  payload: unknown
) => Promise<void>;

class EventBus {
  private handlers = new Map<
    string,
    EventHandler[]
  >();

  on(
    event: string,
    handler: EventHandler
  ) {
    const existing =
      this.handlers.get(event) ?? [];

    existing.push(handler);

    this.handlers.set(
      event,
      existing
    );
  }

  async emit(
    event: string,
    payload: unknown
  ) {
    const handlers =
      this.handlers.get(event) ?? [];

    for (const handler of handlers) {
      await handler(payload);
    }
  }
}

export const eventBus =
  new EventBus();
