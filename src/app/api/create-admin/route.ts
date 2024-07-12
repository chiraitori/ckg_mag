import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { hash } from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const dbName = process.env.MONGODB_DB as string;
    const client = await MongoClient.connect(process.env.MONGODB_URI as string);
    const db = client.db(dbName);

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      await client.close();
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      isAdmin: true, // This makes it an admin account
    });

    await client.close();

    return NextResponse.json({ message: 'Admin account created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}