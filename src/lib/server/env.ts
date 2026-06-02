import "server-only";

function mustGet(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const env = {
  appUrl: () => mustGet("APP_URL"),
  supabase: {
    url: () => mustGet("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: () => mustGet("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    serviceRoleKey: () => mustGet("SUPABASE_SERVICE_ROLE_KEY"),
  },
  stripe: {
    secretKey: () => mustGet("STRIPE_SECRET_KEY"),
    webhookSecret: () => mustGet("STRIPE_WEBHOOK_SECRET"),
    priceStarter: () => mustGet("STRIPE_PRICE_STARTER"),
    priceGrowth: () => mustGet("STRIPE_PRICE_GROWTH"),
    pricePro: () => mustGet("STRIPE_PRICE_PRO"),
  },
  openai: {
    apiKey: () => mustGet("OPENAI_API_KEY"),
  },
  firecrawl: {
    apiKey: () => mustGet("FIRECRAWL_API_KEY"),
  },
  vapi: {
    apiKey: () => mustGet("VAPI_API_KEY"),
    webhookSecret: () => mustGet("VAPI_WEBHOOK_SECRET"),
  },
  twilio: {
    accountSid: () => mustGet("TWILIO_ACCOUNT_SID"),
    authToken: () => mustGet("TWILIO_AUTH_TOKEN"),
  },
  resend: {
    apiKey: () => mustGet("RESEND_API_KEY"),
    fromEmail: () => mustGet("RESEND_FROM_EMAIL"),
  },
};

