import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function PUT(request: NextRequest) {
  console.log('Received PUT request to update inventory by farmId');
  try {
    const { db } = await connectToDatabase();
    console.log('Connected to database');

    const body = await request.json();
    console.log('Received update data:', JSON.stringify(body, null, 2));

    const { farmId, items, uploadDate } = body;

    if (!farmId) {
      console.error('Missing farmId in request body');
      return NextResponse.json({ message: 'Missing farmId' }, { status: 400 });
    }

    console.log('Attempting to update document with farmId:', farmId);

    // First, try to find the document
    const existingDoc = await db.collection('inventory').findOne({ farmId: farmId });
    if (!existingDoc) {
      console.error('Inventory item not found for farmId:', farmId);
      return NextResponse.json({ message: 'Inventory item not found' }, { status: 404 });
    }

    // If document exists, proceed with update
    const result = await db.collection('inventory').findOneAndUpdate(
      { farmId: farmId },
      {
        $set: {
          items,
          uploadDate
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      console.error('Failed to update inventory item for farmId:', farmId);
      return NextResponse.json({ message: 'Failed to update inventory item' }, { status: 500 });
    }

    console.log('Update successful. Updated document:', JSON.stringify(result, null, 2));
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error updating inventory by farmId:', error);
    return NextResponse.json({ message: 'Error updating inventory', error: (error as Error).message }, { status: 500 });
  }
}