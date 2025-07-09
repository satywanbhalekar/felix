import dotenv from 'dotenv';
dotenv.config();

export default {
  PORT: process.env.PORT || 3010,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  keycloak: {
    baseUrl: process.env.KEYCLOAK_BASE_URL!,
    username: process.env.KEYCLOAK_ADMIN_USERNAME!,
    password: process.env.KEYCLOAK_ADMIN_PASSWORD!,
    clientId: process.env.KEYCLOAK_CLIENT_ID!,
  },
  ENV: process.env.ENV || "dev",
  issuerPublicKey: process.env.ISSUER_PUBLIC_KEY || '',
  issuerSecretKey: process.env.ISSUER_SECRET_KEY || '',
};
