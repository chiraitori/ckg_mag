// app/api/inventory/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || '');
    const year = parseInt(searchParams.get('year') || '');

    if (isNaN(month) || isNaN(year)) {
      return NextResponse.json({ message: 'Invalid month or year' }, { status: 400 });
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    console.log('Fetching data for range:', startDate, 'to', endDate);

    const inventoryData = await db.collection('inventory').find({
      uploadDate: { 
        $gte: startDate.toISOString(), 
        $lte: endDate.toISOString() 
      }
    }).toArray();

    console.log('Raw inventory data:', inventoryData);

    const calendarData = inventoryData.reduce((acc, entry) => {
      const date = new Date(entry.uploadDate).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({
        farmId: entry.farmId,
        items: entry.items
      });
      return acc;
    }, {});

    console.log('Processed calendar data:', calendarData);

    return NextResponse.json(calendarData);
  } catch (error) {
    console.error('Error fetching inventory calendar data:', error);
    return NextResponse.json({ message: 'Error fetching inventory calendar data' }, { status: 500 });
  }
}