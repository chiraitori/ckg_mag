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

        // Replace this with your own logic to fetch and compare users from your database
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
            name: user.name,  
            email: user.email,
            farm: user.farm,
            isAdmin: user.isAdmin || false,
            isManager: user.isManager || false,  // This makes it a manager account (replace with your actual role)
            isDirector: user.isDirector || false
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
        token.name = user.name;  
        token.email = user.email;
        token.farm = user.farm;
        token.isAdmin = user.isAdmin;
        token.isManager = user.isManager; 
        token.isDirector = user.isDirector;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;  
        session.user.email = token.email as string;
        session.user.farm = token.farm as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isManager = token.isManager as boolean;
        session.user.isDirector = token.isDirector as boolean;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
};