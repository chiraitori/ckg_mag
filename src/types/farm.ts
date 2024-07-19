import { ObjectId } from 'mongodb';

export interface Farm {
  _id: ObjectId;
  name: string;
  location: string;
  size: number;
}