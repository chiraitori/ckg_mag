import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic'; // Add this line

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // Find the user and their assigned farm
    const user = await db.collection('users').findOne({
      _id: new ObjectId(session.user.id)
    });

    if (!user || !user.assignedFarms || user.assignedFarms.length === 0) {
      return NextResponse.json({ error: 'No farm assigned to user' }, { status: 404 });
    }

    // Get the first assigned farm ObjectId
    const farmId = user.assignedFarms[0];

    // Fetch the farm details
    const farm = await db.collection('farms').findOne({
      _id: farmId  // farmId is already an ObjectId, so we don't need to create a new one
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    // Return the farm details
    return NextResponse.json(farm);
  } catch (error) {
    console.error('Error fetching user farm:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}