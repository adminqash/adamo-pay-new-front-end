import { z } from "zod";

const ENVSchema = z.object({
  VITE_API_BASE_URL: z.url(),
});

const result = ENVSchema.safeParse(import.meta.env);

if (!result.success) {
  throw new Error("Invalid environment variables: " + result.error.message);
}

export const env = result.data;
