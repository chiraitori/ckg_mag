import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';


// GET: Fetch farm(s)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        const { db } = await connectToDatabase();
        const farmsCollection = db.collection('farms');

        if (id) {
            // Fetch a single farm by ID
            const farm = await farmsCollection.findOne({ _id: new ObjectId(id) });
            if (!farm) {
                return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
            }
            return NextResponse.json(farm);
        } else {
            // Fetch all farms (with basic pagination)
            const page = parseInt(searchParams.get('page') || '1');
            const limit = parseInt(searchParams.get('limit') || '10');
            const skip = (page - 1) * limit;

            const farms = await farmsCollection.find().skip(skip).limit(limit).toArray();
            return NextResponse.json(farms);
        }
    } catch (error) {
        console.error('Error fetching farm(s):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Create a new farm
export async function POST(req: NextRequest) {
    try {
        const farmData = await req.json();

        // Basic validation
        if (!farmData.name || !farmData.location) {
            return NextResponse.json({ error: 'Name and location are required' }, { status: 400 });
        }

        const { db } = await connectToDatabase();
        const farmsCollection = db.collection('farms');

        const result = await farmsCollection.insertOne(farmData);

        if (result.acknowledged) {
            return NextResponse.json({ id: result.insertedId, ...farmData }, { status: 201 });
        } else {
            throw new Error('Failed to insert farm');
        }
    } catch (error) {
        console.error('Error creating farm:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT: Update a farm
export async function PUT(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Farm ID is required' }, { status: 400 });
        }

        const updateData = await req.json();

        const { db } = await connectToDatabase();
        const farmsCollection = db.collection('farms');

        const result = await farmsCollection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating farm:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Remove a farm
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Farm ID is required' }, { status: 400 });
        }

        const { db } = await connectToDatabase();
        const farmsCollection = db.collection('farms');

        const result = await farmsCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Farm deleted successfully' });
    } catch (error) {
        console.error('Error deleting farm:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}