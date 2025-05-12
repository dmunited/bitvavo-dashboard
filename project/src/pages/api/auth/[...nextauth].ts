import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

// ✅ Losse named export voor server-side sessiecontrole
export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: true // 👉 Zet op false in productie als je geen logs wilt
};

// ✅ Standaard export voor NextAuth router
export default NextAuth(authOptions);
