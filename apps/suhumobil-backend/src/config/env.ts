import dotenv from "dotenv";

dotenv.config();

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "4000", 10),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  r2AccessKey: process.env.R2_ACCESS_KEY ?? "",
  r2SecretKey: process.env.R2_SECRET_KEY ?? "",
  r2Bucket: process.env.R2_BUCKET ?? "",
  r2Endpoint: process.env.R2_ENDPOINT ?? "",
  r2PublicUrl: process.env.R2_PUBLIC_URL ?? "",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID ?? "",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  isProduction: (process.env.NODE_ENV ?? "development") === "production",
};
