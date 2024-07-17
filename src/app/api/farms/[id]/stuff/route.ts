import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { stuff } = await req.json();

    const { db } = await connectToDatabase();

    // First, check if the farm is assigned to this user
    const user = await db.collection('users').findOne({
      _id: new ObjectId(session.user.id),
      assignedFarms: new ObjectId(id)
    });

    if (!user) {
      return NextResponse.json({ error: 'Farm not found or not authorized' }, { status: 404 });
    }

    // If the user is authorized, update the farm
    const result = await db.collection('farms').updateOne(
      { _id: new ObjectId(id) },
      { $set: { stuff: stuff } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Farm stuff updated successfully' });
  } catch (error) {
    console.error('Error updating farm stuff:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}