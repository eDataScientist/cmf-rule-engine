import localforage from 'localforage';

const DB_KEY = 'claims-rule-engine-db';

localforage.config({
  name: 'ClaimsRuleEngine',
  storeName: 'database',
});

export async function saveDatabase(data: Uint8Array): Promise<void> {
  try {
    await localforage.setItem(DB_KEY, data);
  } catch (error) {
    console.error('Failed to save database:', error);
    throw error;
  }
}

export async function loadDatabase(): Promise<Uint8Array | null> {
  try {
    const data = await localforage.getItem<Uint8Array>(DB_KEY);
    return data;
  } catch (error) {
    console.error('Failed to load database:', error);
    return null;
  }
}

export async function clearDatabase(): Promise<void> {
  try {
    await localforage.removeItem(DB_KEY);
  } catch (error) {
    console.error('Failed to clear database:', error);
    throw error;
  }
}
