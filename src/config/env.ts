import logger from "../logger";
import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const envSchema = z.object({
  TOKEN: z.string().min(1, "DISCORD_TOKEN is required"),
  CLIENT_ID: z.string().min(1, "CLIENT_ID is required"),
  CLIENT_SECRET: z.string().min(1, "CLIENT_ID is required"),
  OWNER_ID: z.string().min(1, "OWNER_ID is required"),
});

const parsedEnv = envSchema.safeParse(process.env);
logger.clear();

if (!parsedEnv.success) {
  let missingEnv = Object.keys(parsedEnv.error.format());
  missingEnv = missingEnv.filter((env) => env !== "_errors");
  logger.error(`Missing environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const env = parsedEnv.data;

export default env;
