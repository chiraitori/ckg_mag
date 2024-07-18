import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    
    // Find the user and their assigned farm
    const user = await db.collection('users').findOne({ _id: new ObjectId(session.user.id) });
    if (!user || !user.assignedFarm) {
      return NextResponse.json({ message: 'User or assigned farm not found' }, { status: 404 });
    }

    // Fetch the farm's inventory
    const farm = await db.collection('farms').findOne({ _id: new ObjectId(user.assignedFarm) });
    if (!farm || !farm.inventory) {
      return NextResponse.json({ message: 'Farm or inventory not found' }, { status: 404 });
    }

    // Assuming farm.inventory is an array of strings
    return NextResponse.json(farm.inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}