export const authConfig = {
  useMockAuth: import.meta.env.DEV,
  useMockData: import.meta.env.DEV,
  jwt: {
    expiryTime: 24 * 60 * 60,
    refreshThreshold: 60 * 60,
  }
};

export default authConfig;
