import { Auth } from "@auth/core"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import { supabase } from "./supabase.js"

// Auth.js configuration with Supabase
export const authConfig = {
  adapter: SupabaseAdapter({
    url: import.meta.env.VITE_SUPABASE_URL,
    secret: import.meta.env.VITE_SUPABASE_ANON_KEY,
  }),
  providers: [
    // Email/Password provider using Supabase Auth
    {
      id: "email",
      name: "Email",
      type: "email",
      server: {
        host: process.env.VITE_SUPABASE_URL,
        port: 587,
        auth: {
          user: process.env.VITE_SUPABASE_ANON_KEY,
        }
      }
    },
    // You can also add OAuth providers like:
    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // }),
    // GitHub({
    //   clientId: process.env.GITHUB_ID,
    //   clientSecret: process.env.GITHUB_SECRET,
    // }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // You can add custom logic here when user signs in
      return true
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log("User signed in:", user.email)
    },
    async signOut({ session, token }) {
      console.log("User signed out")
    },
  }
}

export { Auth }