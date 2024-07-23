import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  console.log('Received PUT request for id:', params.id);
  try {
    if (!params.id || params.id === 'undefined') {
      console.error('Invalid id:', params.id);
      return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
    }

    let objectId;
    try {
      objectId = new ObjectId(params.id);
    } catch (error) {
      console.error('Invalid ObjectId:', params.id, error);
      return NextResponse.json({ message: 'Invalid ObjectId format' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const body = await request.json();
    console.log('Received update data:', body);

    const { farmId, items, uploadDate } = body;

    if (!farmId || !items || !Array.isArray(items) || items.length === 0) {
      console.error('Invalid update data:', body);
      return NextResponse.json({ message: 'Invalid update data' }, { status: 400 });
    }

    const updateFields: any = {
      farmId: farmId,
      items: items,
      uploadDate: uploadDate || new Date().toISOString()
    };

    console.log('Updating with fields:', updateFields);

    const result = await db.collection('inventory').findOneAndUpdate(
      { _id: objectId },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
      console.error('Inventory item not found for id:', params.id);
      return NextResponse.json({ message: 'Inventory item not found' }, { status: 404 });
    }

    console.log('Updated item:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return NextResponse.json({ message: 'Error updating inventory item', error: (error as Error).message }, { status: 500 });
  }
}