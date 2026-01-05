import { openDB, type IDBPDatabase } from 'idb';
import type { EncryptedData, Plan } from '~/types';

const DB_NAME = 'LifeBinderDB';
const DB_VERSION = 1;
const STORE_NAME = 'encryptedPlan';

interface StorageData {
  key: string;
  encryptedData?: EncryptedData;
  plainData?: Plan;
  isEncrypted: boolean;
  updatedAt: string;
  version: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveEncryptedPlan(encryptedData: EncryptedData): Promise<void> {
  try {
    const db = await getDB();
    const data: StorageData = {
      key: 'main-plan',
      encryptedData,
      isEncrypted: true,
      updatedAt: new Date().toISOString(),
      version: DB_VERSION,
    };
    await db.put(STORE_NAME, data);
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please export your data and free up space.');
    }
    throw new Error('Failed to save data. Please try again.');
  }
}

export async function savePlainPlan(plan: Plan): Promise<void> {
  try {
    const db = await getDB();
    const data: StorageData = {
      key: 'main-plan',
      plainData: plan,
      isEncrypted: false,
      updatedAt: new Date().toISOString(),
      version: DB_VERSION,
    };
    await db.put(STORE_NAME, data);
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please export your data and free up space.');
    }
    throw new Error('Failed to save data. Please try again.');
  }
}

export async function loadEncryptedPlan(): Promise<EncryptedData | null> {
  try {
    const db = await getDB();
    const data = await db.get(STORE_NAME, 'main-plan') as StorageData | undefined;
    return data?.encryptedData || null;
  } catch (error) {
    console.error('Failed to load encrypted plan:', error);
    return null;
  }
}

export async function loadPlainPlan(): Promise<Plan | null> {
  try {
    const db = await getDB();
    const data = await db.get(STORE_NAME, 'main-plan') as StorageData | undefined;
    return data?.plainData || null;
  } catch (error) {
    console.error('Failed to load plain plan:', error);
    return null;
  }
}

export async function hasExistingPlan(): Promise<{ exists: boolean; isEncrypted: boolean }> {
  try {
    const db = await getDB();
    const data = await db.get(STORE_NAME, 'main-plan') as StorageData | undefined;
    return {
      exists: !!data,
      isEncrypted: data?.isEncrypted || false,
    };
  } catch (error) {
    console.error('Failed to check for existing plan:', error);
    return { exists: false, isEncrypted: false };
  }
}

export async function clearAllData(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
  } catch (error) {
    console.error('Failed to clear data:', error);
    throw new Error('Failed to clear data');
  }
}
