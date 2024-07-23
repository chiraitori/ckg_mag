import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { farmId, items, uploadDate } = await request.json();

    const result = await db.collection('inventory').insertOne({
      farmId,
      items,
      uploadDate
    });

    return NextResponse.json({ message: 'Inventory uploaded successfully', id: result.insertedId }, { status: 200 });
  } catch (error) {
    console.error('Error uploading inventory:', error);
    return NextResponse.json({ message: 'Error uploading inventory' }, { status: 500 });
  }
}