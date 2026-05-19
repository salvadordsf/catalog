import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { z } from "zod";
import { errorFormater } from "../utils/error/error-formater.util";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    debugLogs: true,
  }),
  trustedOrigins: [
    //Add your frontend URL here
    "http://localhost:3001",
  ],
  advanced: {
    disableOriginCheck: false,
    useSecureCookies: true,
    database: {
      generateId: false,
    },
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  //Additionals fields
  user: {
    additionalFields: {
      name: {
        type: "string",
        unique: false,
        input: true,
      },
      role: {
        type: "string",
        defaultValue: "USER",
        input: false,
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        //Name field
        const name = z
          .string()
          .trim()
          .min(6, "Name must have at least 6 characters")
          .safeParse(ctx.body.name);
        if (!name.success) {
          const error = errorFormater(name.error);
          throw new APIError("BAD_REQUEST", error);
        }
        //Email field
        const email = z.string().trim().email().safeParse(ctx.body.email);
        if (!email.success) {
          const error = errorFormater(email.error);
          throw new APIError("BAD_REQUEST", error);
        }
      }
    }),
  },
});

export type Session = typeof auth.$Infer.Session;
