import { openDB } from 'idb';

const DB_NAME = 'levelup-db';
const DB_VERSION = 1;
const STORES = ['habits', 'goals', 'offline-queue'];

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        STORES.forEach((store) => {
          if (!db.objectStoreNames.contains(store)) db.createObjectStore(store);
        });
      },
    }).catch(() => null); // Fallback if IndexedDB unavailable
  }
  return dbPromise;
}

export async function getItem(store, key) {
  const db = await getDB();
  if (!db) return JSON.parse(localStorage.getItem(`${store}:${key}`) || 'null');
  return db.get(store, key);
}

export async function setItem(store, key, value) {
  const db = await getDB();
  if (!db) return localStorage.setItem(`${store}:${key}`, JSON.stringify(value));
  return db.put(store, value, key);
}

export async function deleteItem(store, key) {
  const db = await getDB();
  if (!db) return localStorage.removeItem(`${store}:${key}`);
  return db.delete(store, key);
}

export async function getAllItems(store) {
  const db = await getDB();
  if (!db) return [];
  return db.getAll(store);
}

export async function clearStore(store) {
  const db = await getDB();
  if (!db) return;
  return db.clear(store);
}
