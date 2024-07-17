// pages/api/inventory.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { db } = await connectToDatabase();
    
    // Find the user and their assigned farm
    const user = await db.collection('users').findOne({ _id: new ObjectId(session.user.id) });
    if (!user || !user.assignedFarm) {
      return res.status(404).json({ message: 'User or assigned farm not found' });
    }

    // Fetch the farm's inventory
    const farm = await db.collection('farms').findOne({ _id: new ObjectId(user.assignedFarm) });
    if (!farm || !farm.inventory) {
      return res.status(404).json({ message: 'Farm or inventory not found' });
    }

    // Assuming farm.inventory is an array of strings
    res.status(200).json(farm.inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}