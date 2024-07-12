import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoClient } from 'mongodb';
import { compare } from 'bcrypt';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        // Check if user exists and password is correct
        // Replace 'users' with your actual collection name in your MongoDB database
        // Replace 'email' and 'password' with your actual field names in your users collection

        // Example using MongoDB with Mongoose
        // const User = mongoose.model('User');
        // const user = await User.findOne({ email: credentials.email });
        // if (!user ||!(await user.comparePassword(credentials.password))) {
        //   return null;
        // }
        // return user;
        const dbName = process.env.MONGODB_DB as string;
        const client = await MongoClient.connect(process.env.MONGODB_URI as string);
        const db = client.db(dbName);
        const user = await db.collection('users').findOne({ email: credentials.email });
        await client.close();

        if (user && await compare(credentials.password, user.password)) {
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