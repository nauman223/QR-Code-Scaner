import { Injectable } from '@angular/core';

import type { HistoryEntry, HistorySource } from '@core/models/history-entry.model';

const DATABASE_NAME = 'qr-scan';
const DATABASE_VERSION = 1;
const STORE_NAME = 'history';

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  databasePromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
        store.createIndex('source', 'source');
      }
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(new Error(request.error?.message ?? 'Failed to open the history database.'));
    };
  });
  return databasePromise;
}

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(new Error(request.error?.message ?? 'History database request failed.'));
    };
  });
}

async function getStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
  const db = await openDatabase();
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
}

/**
 * Typed IndexedDB-backed store for scan/generate history. Deliberately dumb:
 * it knows nothing about search, filtering, or sorting beyond what its two
 * indexes provide — that logic belongs to the History feature, which reads
 * `getAll()` into signals and derives the rest.
 */
@Injectable({ providedIn: 'root' })
export class HistoryRepository {
  public async add(entry: HistoryEntry): Promise<void> {
    const store = await getStore('readwrite');
    await promisifyRequest(store.add(entry));
  }

  public async update(entry: HistoryEntry): Promise<void> {
    const store = await getStore('readwrite');
    await promisifyRequest(store.put(entry));
  }

  public async delete(id: string): Promise<void> {
    const store = await getStore('readwrite');
    await promisifyRequest(store.delete(id));
  }

  public async deleteMany(ids: readonly string[]): Promise<void> {
    const store = await getStore('readwrite');
    await Promise.all(ids.map((id) => promisifyRequest(store.delete(id))));
  }

  public async clear(source?: HistorySource): Promise<void> {
    const store = await getStore('readwrite');
    if (source === undefined) {
      await promisifyRequest(store.clear());
      return;
    }
    const matching = await this.getAll(source);
    await Promise.all(matching.map((entry) => promisifyRequest(store.delete(entry.id))));
  }

  public async getById(id: string): Promise<HistoryEntry | null> {
    const store = await getStore('readonly');
    const request = store.get(id) as IDBRequest<HistoryEntry | undefined>;
    const result = await promisifyRequest(request);
    return result ?? null;
  }

  public async getAll(source: HistorySource): Promise<HistoryEntry[]> {
    const store = await getStore('readonly');
    const request = store.index('source').getAll(IDBKeyRange.only(source)) as IDBRequest<
      HistoryEntry[]
    >;
    const results = await promisifyRequest(request);
    return results.sort((a, b) => b.createdAt - a.createdAt);
  }

  public async count(source?: HistorySource): Promise<number> {
    const store = await getStore('readonly');
    if (source === undefined) {
      return promisifyRequest(store.count());
    }
    return promisifyRequest(store.index('source').count(IDBKeyRange.only(source)));
  }
}
