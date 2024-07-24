import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const uri = process.env.MONGODB_URI;
const options: { [key: string]: any } = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

interface CachedConnection {
  client: MongoClient;
  db: Db;
}

let cached: CachedConnection | null = null;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connectToDatabase(): Promise<CachedConnection> {
  console.log('Attempting to connect to database');
  
  if (cached) {
    console.log('Using cached database connection');
    return cached;
  }

  if (!clientPromise) {
    console.error('MongoDB client promise is not initialized');
    throw new Error('MongoDB client promise is not initialized');
  }

  try {
    client = await clientPromise;
    console.log('Successfully connected to MongoDB');
    
    const dbName = process.env.MONGODB_DB || new URL(uri).pathname.substr(1);
    console.log(`Using database: ${dbName}`);
    
    const db = client.db(dbName);

    cached = { client, db };
    console.log('Database connection cached');
    return cached;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}

export { clientPromise };