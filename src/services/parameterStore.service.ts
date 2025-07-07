export async function getparametersFromAWS(keys: string[]): Promise<Record<string, string>> {
    const fakeSecrets: Record<string, string> = {
      'dev-heroes-backend-client': 'mock-secret-123',
      'dev-kc-url': 'https://63c7-103-58-154-251.ngrok-free.app',
    };
  
    const result: Record<string, string> = {};
    for (const key of keys) {
      result[key] = fakeSecrets[key];
    }
    return result;
  }
  