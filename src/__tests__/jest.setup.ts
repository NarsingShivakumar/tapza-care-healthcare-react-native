// A deterministic persistent-store double for unit tests; no Android/iOS runtime required.
jest.mock('@react-native-async-storage/async-storage', () => {
  const values = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => values.get(key) ?? null),
      setItem: jest.fn(async (key: string, value: string) => {values.set(key, value);}),
      multiGet: jest.fn(async (keys: string[]) => keys.map(key => [key, values.get(key) ?? null])),
      removeItem: jest.fn(async (key: string) => {values.delete(key);}),
    },
  };
});
