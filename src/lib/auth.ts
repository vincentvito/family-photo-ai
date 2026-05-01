import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { authDb } from "@/lib/auth-db";
import { sendAuthOtpEmail } from "@/lib/auth-email";
import * as authSchema from "@/../db/auth-schema";

const baseURL = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;

if (!baseURL) {
  throw new Error("BETTER_AUTH_URL or NEXT_PUBLIC_APP_URL is required");
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  database: drizzleAdapter(authDb, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      async sendVerificationOTP({ email, otp, type }) {
        await sendAuthOtpEmail({ email, otp, type });
      },
    }),
  ],
  trustedOrigins: [baseURL],
});
