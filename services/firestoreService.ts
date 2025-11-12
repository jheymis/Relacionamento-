import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  addDoc,
  query, 
  where, 
  limit,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { User, Match, Message } from '../types';

// Create or update a user profile in the 'users' collection
export const createUserProfile = async (user: User) => {
  // Use setDoc with the user's UID as the document ID
  await setDoc(doc(db, 'users', user.id), {
    name: user.name,
    age: user.age,
    bio: user.bio,
    photos: user.photos,
    energy: user.energy,
    verified: user.verified,
    email: user.email,
  });
};

// Get potential matches for the current user to swipe on
export const getPotentialMatches = async (currentUserId: string): Promise<User[]> => {
    const usersCollection = collection(db, 'users');
    // In a real app, you'd add complex logic to exclude users already swiped on.
    // For now, we fetch a few users who are not the current user.
    const q = query(usersCollection, where('__name__', '!=', currentUserId), limit(10));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

// Handle a swipe action and check for a new match
export const handleSwipe = async (swiperId: string, swipedId: string, action: 'like' | 'pass'): Promise<boolean> => {
    const swipeRef = doc(collection(db, 'swipes'));
    // Record the swipe action
    await setDoc(swipeRef, { swiperId, swipedId, action, timestamp: serverTimestamp() });

    if (action === 'like') {
        // Check if the other user has liked us back
        const q = query(collection(db, 'swipes'), 
            where('swiperId', '==', swipedId), 
            where('swipedId', '==', swiperId),
            where('action', '==', 'like'),
            limit(1)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            // It's a match! Create a new document in the 'matches' collection
            const matchRef = collection(db, 'matches');
            await addDoc(matchRef, {
                users: [swiperId, swipedId],
                matchTimestamp: serverTimestamp()
            });
            return true; // Return true to indicate a match was made
        }
    }
    return false; // No match
};


// Get a user's matches in real-time
export const getMatches = (userId: string, callback: (matches: Match[]) => void) => {
    const q = query(collection(db, 'matches'), where('users', 'array-contains', userId));
    // onSnapshot creates a real-time listener
    return onSnapshot(q, (querySnapshot) => {
        const matches = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Match));
        callback(matches);
    });
};

// Get a single user profile by their ID
export const getUserProfile = async (userId: string): Promise<User | null> => {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if(userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
}

// Get messages for a chat in real-time
export const getMessages = (matchId: string, callback: (messages: Message[]) => void) => {
    const messagesCollection = collection(db, 'chats', matchId, 'messages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));

    // onSnapshot creates a real-time listener for new messages
    return onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Message));
        callback(messages);
    });
};

// Send a new message to a chat
export const sendMessage = async (matchId: string, senderId: string, text: string) => {
    // Add the new message to the 'messages' sub-collection
    const messagesCollection = collection(db, 'chats', matchId, 'messages');
    await addDoc(messagesCollection, {
        senderId,
        text,
        timestamp: serverTimestamp()
    });
    // Also update the last message on the parent match document for chat previews
    const matchDocRef = doc(db, 'matches', matchId);
    await setDoc(matchDocRef, {
        lastMessage: text,
        lastMessageTimestamp: serverTimestamp()
    }, { merge: true });
};
