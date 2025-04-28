import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { db } from "../db/drizzle";
import * as schema from "../db/schema";
import { config } from "dotenv";
import { Resend } from "resend";
import PasswordReset from "../email/PasswordReset";

config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, token }) => {
      const confirmationUrl = `${process.env.CLIENT_URL}/auth/reset?token=${token}`;
      await resend.emails.send({
        from: "info@aumentapacientes.com",
        to: [user.email],
        subject: "Reinicie tu contraseña",
        react: <PasswordReset name={user.name} url={confirmationUrl} />,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, token }) => {
      const confirmationUrl = `${process.env.CLIENT_URL}/auth/verify?token=${token}`;

      const { error } = await resend.emails.send({
        from: "info@aumentapacientes.com",
        to: user.email,
        subject: "Verifica tu correo electronico",
        text: `Verifica tu correo electronico`,
        html: `Verifica tu correo electronico: ${confirmationUrl}`,
      });

      if (error) {
        return;
      }
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: [`${process.env.CLIENT_URL}`],
});
