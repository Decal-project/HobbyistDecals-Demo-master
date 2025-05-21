// next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Add the `id` field
      email: string;
      image?: string | null;
    };
  }

  interface JWT {
    id: string; // Add the `id` field to the JWT
    email: string;
  }
}
