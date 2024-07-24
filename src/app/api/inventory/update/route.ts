import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface UpdateFields {
  farmId: string;
  items: any[]; // Consider creating a more specific type for items
  lastEditedBy: string;
  lastEditedAt: string;
  uploadDate?: string; // Make this optional
}

interface RequestBody extends UpdateFields {
  _id?: string;
}

export async function PUT(request: NextRequest) {
  console.log('Received PUT request to update inventory');
  try {
    const { db } = await connectToDatabase();
    console.log('Connected to database');

    const body: RequestBody = await request.json();
    console.log('Received update data:', JSON.stringify(body, null, 2));

    const { _id, farmId, items, uploadDate, lastEditedBy, lastEditedAt } = body;

    if (!_id && !farmId) {
      console.error('Missing both _id and farmId in request body');
      return NextResponse.json({ message: 'Missing both _id and farmId' }, { status: 400 });
    }

    let query: { _id?: ObjectId; farmId?: string } = {};
    if (_id && ObjectId.isValid(_id)) {
      query._id = new ObjectId(_id);
    } else if (farmId) {
      query.farmId = farmId;
    }

    console.log('Attempting to update document with query:', JSON.stringify(query));

    const updateFields: UpdateFields = {
      farmId,
      items,
      lastEditedBy,
      lastEditedAt,
    };

    if (uploadDate) {
      updateFields.uploadDate = uploadDate;
    }

    const result = await db.collection('inventory').findOneAndUpdate(
      query,
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
      console.error('Inventory item not found for query:', JSON.stringify(query));
      return NextResponse.json({ message: 'Inventory item not found' }, { status: 404 });
    }

    const responseData = {
      ...result,
      uploadDate: result.uploadDate || body.uploadDate || new Date().toISOString()
    };

    console.log('Update successful. Updated document:', JSON.stringify(responseData, null, 2));
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json({ message: 'Error updating inventory', error: (error as Error).message }, { status: 500 });
  }
}