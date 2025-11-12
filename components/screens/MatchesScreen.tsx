import React, { useState, useEffect } from 'react';
import { User, Match } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getMatches, getUserProfile } from '../../services/firestoreService';

interface MatchCardProps {
  user: User;
}

const MatchCard: React.FC<MatchCardProps> = ({ user }) => {
  return (
    <div 
      className="relative aspect-[3/4] rounded-lg overflow-hidden group cursor-pointer transform hover:-translate-y-1 transition-transform duration-300"
    >
      <img src={user.photos[0]} alt={user.name} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-3">
        <h3 className="text-white font-bold text-lg">{user.name}</h3>
      </div>
    </div>
  );
};

const MatchesScreen = () => {
  const [matchedUsers, setMatchedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to real-time updates for matches
    const unsubscribe = getMatches(currentUser.id, async (fetchedMatches) => {
        setLoading(true);
        
        // Find the other user's ID in each match
        const userIds = fetchedMatches
          .map(m => m.users.find(uid => uid !== currentUser.id))
          .filter(Boolean) as string[];
        
        // Fetch the profile for each matched user
        const userProfiles = await Promise.all(userIds.map(id => getUserProfile(id)));
        
        setMatchedUsers(userProfiles.filter((u): u is User => u !== null));
        setLoading(false);
    });

    // Unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="w-full h-full flex flex-col pt-4 pb-16 overflow-y-auto">
      <div className="px-4 mb-4">
        <h1 className="text-3xl font-bold text-white">Matches &amp; Conversas</h1>
        <p className="text-slate-400">Este é o começo de algo especial.</p>
      </div>
      <div className="flex-grow p-4">
        {loading ? (
           <div className="flex items-center justify-center h-full text-slate-400">
             Carregando matches...
           </div>
        ) : matchedUsers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {matchedUsers.map(user => (
              <MatchCard key={user.id} user={user} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
            <h2 className="text-xl font-semibold">Nenhum match ainda</h2>
            <p>Continue deslizando para encontrar pessoas!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesScreen;
