import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP } from "better-auth/plugins";
import { after } from "next/server";
import { db } from "@/lib/db";
import { sendAuthOtpEmail, sendWelcomeEmail } from "@/lib/auth-email";
import * as authSchema from "@/../db/auth-schema";

const baseURL = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
const authSecret = process.env.BETTER_AUTH_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!baseURL) {
  throw new Error("BETTER_AUTH_URL or NEXT_PUBLIC_APP_URL is required");
}

if (!authSecret || authSecret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be set to at least 32 characters");
}

if ((googleClientId && !googleClientSecret) || (!googleClientId && googleClientSecret)) {
  throw new Error("Both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required for Google sign-in");
}

export const auth = betterAuth({
  secret: authSecret,
  baseURL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  databaseHooks: {
    user: {
      create: {
        async after(user) {
          after(() =>
            sendWelcomeEmail({ email: user.email, name: user.name }).catch((error) => {
              console.error("Failed to send welcome email", error);
            }),
          );
        },
      },
    },
  },
  emailAndPassword: {
    enabled: false,
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            prompt: "select_account",
          },
        }
      : undefined,
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      async sendVerificationOTP({ email, otp, type }) {
        await sendAuthOtpEmail({ email, otp, type });
      },
    }),
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
  trustedOrigins: [baseURL],
});
