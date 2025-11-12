import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { XMarkIcon, HeartIcon, StarIcon, VerifiedIcon } from '../icons';
import { useAuth } from '../../contexts/AuthContext';
import { getPotentialMatches, handleSwipe } from '../../services/firestoreService';

const UserCard: React.FC<{ user: User }> = ({ user }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev + 1) % user.photos.length);
  };
  
  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev - 1 + user.photos.length) % user.photos.length);
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-slate-800 select-none">
      <img src={user.photos[currentPhotoIndex]} alt={user.name} className="w-full h-full object-cover" />
      
      {/* Photo navigation */}
      <div className="absolute top-0 left-0 right-0 flex p-2 space-x-1">
        {user.photos.map((_, index) => (
          <div key={index} className={`h-1 flex-1 rounded-full ${index === currentPhotoIndex ? 'bg-white/90' : 'bg-white/40'}`}></div>
        ))}
      </div>
      <div className="absolute top-0 left-0 w-1/2 h-full cursor-pointer" onClick={prevPhoto}></div>
      <div className="absolute top-0 right-0 w-1/2 h-full cursor-pointer" onClick={nextPhoto}></div>

      {/* Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
        <div className="flex items-center">
            <h1 className="text-4xl font-extrabold">{user.name}, {user.age}</h1>
            {user.verified && <VerifiedIcon className="w-7 h-7 text-cyan-400 ml-2" />}
        </div>
        <p className="mt-2 text-lg text-slate-200">{user.bio}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {user.energy.map((e) => (
            <span key={e} className="bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1 rounded-full">{e}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, colorClass, big }: { icon: React.ReactNode, colorClass: string, big?: boolean }) => {
  const sizeClass = big ? 'w-20 h-20' : 'w-16 h-16';
  const iconSizeClass = big ? 'w-10 h-10' : 'w-8 h-8';
  return (
    <button className={`flex items-center justify-center ${sizeClass} rounded-full bg-slate-800 shadow-lg hover:bg-slate-700 hover:scale-110 transition-all duration-200 ease-in-out`}>
      {React.cloneElement(icon as React.ReactElement, { className: `${iconSizeClass} ${colorClass}` })}
    </button>
  );
};


const DiscoverScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatch, setShowMatch] = useState<User | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      if (currentUser) {
        setLoading(true);
        const potentialMatches = await getPotentialMatches(currentUser.id);
        setUsers(potentialMatches);
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentUser]);

  const handleAction = async (action: 'like' | 'pass' | 'superlike') => {
    if (currentIndex >= users.length || !currentUser) return;

    const swipedUser = users[currentIndex];
    // For this implementation, superlike is treated the same as a like
    const isMatch = await handleSwipe(currentUser.id, swipedUser.id, action === 'pass' ? 'pass' : 'like');

    if (isMatch) {
      setShowMatch(swipedUser);
    }

    // Move to the next card
    setCurrentIndex(prev => prev + 1);
  };
  
  if (showMatch) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm absolute inset-0 z-50 text-white p-4 text-center">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 text-transparent bg-clip-text mb-4">É um Match!</h2>
            <p className="text-xl text-slate-300 mb-8">Você e {showMatch.name} se curtiram.</p>
            <div className="flex items-center space-x-[-40px] mb-8">
                <img src={currentUser?.photos[0] || "https://picsum.photos/id/433/200/200"} className="w-32 h-32 rounded-full object-cover border-4 border-pink-500" alt="Your photo" />
                <img src={showMatch.photos[0]} className="w-32 h-32 rounded-full object-cover border-4 border-cyan-400" alt={showMatch.name} />
            </div>
            <button className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-full transition-colors mb-4" onClick={() => setShowMatch(null)}>Enviar uma mensagem (Em breve)</button>
            <button onClick={() => setShowMatch(null)} className="text-slate-400 hover:text-white transition-colors">Continuar deslizando</button>
        </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="flex-grow w-full max-w-md mx-auto relative mb-4">
        {loading ? (
            <div className="text-center text-slate-400 flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4">Buscando perfis...</p>
            </div>
        ) : currentIndex < users.length ? (
            users.slice(currentIndex, currentIndex + 2).reverse().map((user, index) => (
                <div key={user.id} className="absolute inset-0 transition-transform duration-300" style={{ transform: `scale(${1 - (index * 0.05)}) translateY(-${index * 10}px)`}}>
                    <UserCard user={user} />
                </div>
            ))
        ) : (
          <div className="text-center text-slate-400 flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-bold">É tudo por agora</h2>
            <p>Volte mais tarde para ver novos perfis.</p>
          </div>
        )}
      </div>

      {!loading && currentIndex < users.length && (
        <div className="flex items-center justify-center space-x-6 pb-20">
          <button onClick={() => handleAction('pass')}><ActionButton icon={<XMarkIcon />} colorClass="text-yellow-400" /></button>
          <button onClick={() => handleAction('like')}><ActionButton icon={<HeartIcon />} colorClass="text-green-400" big /></button>
          <button onClick={() => handleAction('superlike')}><ActionButton icon={<StarIcon />} colorClass="text-blue-400" /></button>
        </div>
      )}
    </div>
  );
};

export default DiscoverScreen;