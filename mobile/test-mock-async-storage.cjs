// Mock for @react-native-async-storage/async-storage in Node.js test environment
const store = new Map();

const mockAsyncStorage = {
  getItem: async (key) => store.get(key) || null,
  setItem: async (key, value) => {
    store.set(key, String(value));
  },
  removeItem: async (key) => {
    store.delete(key);
  },
  clear: async () => {
    store.clear();
  },
  getAllKeys: async () => Array.from(store.keys()),
  getMany: async (keys) => {
    const res = {};
    keys.forEach((key) => {
      res[key] = store.get(key) || null;
    });
    return res;
  },
  setMany: async (entries) => {
    Object.entries(entries).forEach(([k, v]) => store.set(k, String(v)));
  },
  removeMany: async (keys) => {
    keys.forEach((key) => store.delete(key));
  },
  multiGet: async (keys) => keys.map((key) => [key, store.get(key) || null]),
  multiSet: async (keyValuePairs) => {
    keyValuePairs.forEach(([key, value]) => store.set(key, String(value)));
  },
  multiRemove: async (keys) => {
    keys.forEach((key) => store.delete(key));
  },
};

module.exports = mockAsyncStorage;
module.exports.default = mockAsyncStorage;
