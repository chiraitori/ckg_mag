import nextAuth from 'next-auth';
import credentialsProvider from 'next-auth/providers/credentials';
import { MongoClient } from 'mongodb';
import { compare } from 'bcrypt';

const authOptions = {
  providers: [
    credentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const client = await MongoClient.connect(process.env.MONGODB_URI as string);
        const db = client.db();
        const user = await db.collection('users').findOne({ email: credentials?.email });
        await client.close();

        if (user && credentials?.password && await compare(credentials.password, user.password)) {
          return {
            id: user._id.toString(),
            email: user.email,
            isAdmin: user.isAdmin || false
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
};

export default nextAuth(authOptions);
