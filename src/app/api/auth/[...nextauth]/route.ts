import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const prisma = new PrismaClient();

const handler = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Ensure that username and password are of type 'string'
                const { username, password } = credentials as {
                    username: string;
                    password: string;
                };

                if (!username || !password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { username }
                });

                if (!user) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(password, user.password);

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    role: user.role
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.username = user.username;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.name = token.name as string;
                session.user.username = token.username as string;
                session.user.role = token.role as string;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login', // custom sign-in page path
    },
    session: {
        strategy: "jwt",
    },
});

export { handler as GET, handler as POST };

