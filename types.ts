export interface User {
  id: string; // Changed from number to string for Firebase UID
  name: string;
  age: number;
  bio: string;
  photos: string[];
  energy: string[];
  verified: boolean;
  email?: string; // Add email for auth purposes
}

export interface Message {
  id: string; // Firestore document ID
  senderId: string; // Firebase UID
  text: string;
  timestamp: any; // Firestore Timestamp
}

export interface Match {
  id: string; // Firestore document ID
  users: string[]; // Array of two user IDs
  lastMessage?: string;
  lastMessageTimestamp?: any; // Firestore Timestamp
}

export enum AppScreen {
  Discover = 'DISCOVER',
  Matches = 'MATCHES',
  Chat = 'CHAT',
  Profile = 'PROFILE',
}