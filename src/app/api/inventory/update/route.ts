import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest) {
  console.log('Received PUT request to update inventory');
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    console.log('Received update data:', JSON.stringify(body, null, 2));

    const { _id, farmId, items, uploadDate } = body;

    if (!_id) {
      console.error('Missing _id in request body');
      return NextResponse.json({ message: 'Missing _id' }, { status: 400 });
    }

    console.log('Attempting to update document with _id:', _id);

    const result = await db.collection('inventory').findOneAndUpdate(
      { _id: new ObjectId(_id) },
      {
        $set: {
          farmId,
          items,
          uploadDate
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      console.error('Inventory item not found for _id:', _id);
      return NextResponse.json({ message: 'Inventory item not found' }, { status: 404 });
    }

    console.log('Update successful. Updated document:', JSON.stringify(result, null, 2));
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json({ message: 'Error updating inventory', error: (error as Error).message }, { status: 500 });
  }
}