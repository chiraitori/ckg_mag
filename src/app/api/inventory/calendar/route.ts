import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '');
    const month = parseInt(searchParams.get('month') || '');

    console.log(`Fetching data for year: ${year}, month: ${month}`);

    if (isNaN(year) || isNaN(month)) {
      return NextResponse.json({ message: 'Invalid year or month' }, { status: 400 });
    }

    // Construct the date range for the query
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    console.log(`Start date: ${startDate.toISOString()}, End date: ${endDate.toISOString()}`);

    const inventoryData = await db.collection('inventory').find({
      uploadDate: {
        $gte: startDate.toISOString(),
        $lte: endDate.toISOString()
      }
    }).toArray();

    console.log(`Found ${inventoryData.length} inventory items`);
    console.log('Inventory data:', JSON.stringify(inventoryData, null, 2));

    return NextResponse.json(inventoryData);
  } catch (error) {
    console.error('Error fetching inventory calendar data:', error);
    return NextResponse.json({ message: 'Error fetching inventory calendar data' }, { status: 500 });
  }
}