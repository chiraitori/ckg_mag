import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { hash } from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { name, email, password, farmId } = await request.json();

    if (!name || !email || !password || !farmId) {
      return NextResponse.json({ error: 'Name, email, password, and farmId are required' }, { status: 400 });
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

    // Insert the new manager user
    const insertResult = await db.collection('users').insertOne({
      name,
      email,
      password: hashedPassword,
      isAdmin: false,
      isDirector: false,
      isManager: true,
      assignedFarms: [new ObjectId(farmId)]
    });

    const newManagerId = insertResult.insertedId;

    // Update the farm to include this manager
    await db.collection('farms').updateOne(
      { _id: new ObjectId(farmId) },
      { $set: { managerId: newManagerId } }
    );

    await client.close();

    return NextResponse.json({ message: 'Manager account created and farm assigned successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating manager account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}