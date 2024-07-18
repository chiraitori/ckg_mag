import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // Fetch the manager's user document to get the assignedFarms
    const managerUser = await db.collection('users').findOne({ _id: new ObjectId(session.user.id) });

    if (!managerUser || !managerUser.assignedFarms || managerUser.assignedFarms.length === 0) {
      return NextResponse.json({ message: 'No farms assigned to this manager' }, { status: 404 });
    }

    // Fetch the farms using the assignedFarms array
    const farms = await db.collection('farms')
      .find({ _id: { $in: managerUser.assignedFarms } })
      .toArray();

    if (farms.length === 0) {
      return NextResponse.json({ message: 'No farms found for this manager' }, { status: 404 });
    }

    return NextResponse.json(farms);
  } catch (error) {
    console.error('Error fetching farms:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}