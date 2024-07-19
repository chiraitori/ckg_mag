import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  isAdmin: boolean;
  isDirector: boolean;
  isManager: boolean;
  isSeller: boolean;
  assignedFarms: string[];
}