import type {
  MemoryNamespace,
  MemoryRecord
} from "./types";

export class MemoryEngine {
  private store: MemoryRecord[] = [];

  async write<T>(
    namespace: MemoryNamespace,
    key: string,
    value: T
  ) {
    const record: MemoryRecord<T> = {
      id: crypto.randomUUID(),
      namespace,
      key,
      value,
      createdAt: new Date().toISOString()
    };

    this.store.push(record);

    return record;
  }

  async read(
    namespace: MemoryNamespace,
    key: string
  ) {
    return this.store.find(
      (record) =>
        record.namespace === namespace &&
        record.key === key
    );
  }

  async search(
    namespace: MemoryNamespace,
    query: string
  ) {
    return this.store.filter(
      (record) =>
        record.namespace === namespace &&
        JSON.stringify(
          record.value
        ).includes(query)
    );
  }

  async summarize(
    namespace: MemoryNamespace
  ) {
    return this.store.filter(
      (record) =>
        record.namespace === namespace
    );
  }
}

export const memoryEngine =
  new MemoryEngine();
