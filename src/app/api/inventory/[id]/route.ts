// app/api/inventory/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase();
    const { quantity } = await request.json();

    if (typeof quantity !== 'number') {
      return NextResponse.json({ message: 'Invalid quantity' }, { status: 400 });
    }

    const result = await db.collection('inventory').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { 
        $set: { quantity: quantity },
        $inc: { editCount: 1 }
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return NextResponse.json({ message: 'Inventory item not found' }, { status: 404 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json({ message: 'Error updating inventory item' }, { status: 500 });
  }
}