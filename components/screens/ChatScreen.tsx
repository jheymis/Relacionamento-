import React, { useState, useEffect, useRef } from 'react';
import { User, Match, Message } from '../../types';
import { PaperAirplaneIcon, SparklesIcon } from '../icons';
import { getChatSuggestion, moderateMessage } from '../../services/geminiService';
import { useAuth } from '../../contexts/AuthContext';
import { getMatches, getUserProfile, getMessages, sendMessage } from '../../services/firestoreService';

const ChatView = ({ match, user, onBack }: { match: Match; user: User; onBack: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { currentUser } = useAuth();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Subscribe to real-time messages for this specific chat
  useEffect(() => {
    const unsubscribe = getMessages(match.id, setMessages);
    return () => unsubscribe();
  }, [match.id]);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (newMessage.trim() === '' || isSending || !currentUser) return;

    setIsSending(true);

    const isSafe = await moderateMessage(newMessage);
    if (!isSafe) {
      alert("Sua mensagem viola nossas diretrizes de segurança e não foi enviada. Por favor, seja respeitoso.");
      setIsSending(false);
      return;
    }

    await sendMessage(match.id, currentUser.id, newMessage);
    setNewMessage('');
    setIsSending(false);
  };

  const handleSuggestion = async () => {
    setIsSuggesting(true);
    const suggestion = await getChatSuggestion(user.name);
    setNewMessage(suggestion);
    setIsSuggesting(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="flex items-center p-4 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <button onClick={onBack} className="text-white mr-4 md:hidden">&larr;</button>
        <img src={user.photos[0]} alt={user.name} className="w-10 h-10 rounded-full object-cover mr-4" />
        <h2 className="text-xl font-bold text-white">{user.name}</h2>
      </div>

      {/* Messages */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
            {msg.senderId !== currentUser?.id && <img src={user.photos[0]} className="w-6 h-6 rounded-full object-cover" alt={user.name}/> }
            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.senderId === currentUser?.id ? 'bg-pink-500 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite uma mensagem..."
            disabled={isSending}
            className="w-full bg-slate-700 text-white rounded-full py-3 pl-12 pr-24 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <button onClick={handleSuggestion} disabled={isSuggesting || isSending} className="text-yellow-400 hover:text-yellow-300 disabled:opacity-50 disabled:animate-pulse">
                <SparklesIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
             <button onClick={handleSend} disabled={isSending} className="bg-pink-500 rounded-full p-2 w-9 h-9 flex items-center justify-center text-white hover:bg-pink-600 transition-colors disabled:opacity-50">
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <PaperAirplaneIcon className="w-5 h-5" />
                )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const ChatScreen = () => {
    const [matchesWithUsers, setMatchesWithUsers] = useState<{match: Match, user: User}[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<{match: Match, user: User} | null>(null);
    const { currentUser } = useAuth();
    
    useEffect(() => {
        if (!currentUser) return;
        const unsubscribe = getMatches(currentUser.id, async (fetchedMatches) => {
            const matchesData = await Promise.all(
                fetchedMatches.map(async (match) => {
                    const otherUserId = match.users.find(uid => uid !== currentUser.id);
                    if (!otherUserId) return null;
                    const user = await getUserProfile(otherUserId);
                    return user ? { match, user } : null;
                })
            );
            setMatchesWithUsers(matchesData.filter(Boolean) as {match: Match, user: User}[]);
        });
        return () => unsubscribe();
    }, [currentUser]);

    if (selectedMatch) {
        return (
            <div className="w-full h-full pb-16">
                <ChatView match={selectedMatch.match} user={selectedMatch.user} onBack={() => setSelectedMatch(null)} />
            </div>
        )
    }

  return (
    <div className="w-full h-full flex flex-col pt-4 pb-16">
      <h1 className="text-3xl font-bold text-white px-4 mb-4">Conversas</h1>
      <div className="overflow-y-auto">
        {matchesWithUsers.length > 0 ? matchesWithUsers.map(({ match, user }) => (
            <div key={match.id} onClick={() => setSelectedMatch({ match, user })} className="flex items-center p-4 hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-700">
              <img src={user.photos[0]} alt={user.name} className="w-14 h-14 rounded-full object-cover mr-4" />
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                <p className="text-slate-400 truncate">{match.lastMessage || "Comece a conversa!"}</p>
              </div>
              {/* <span className="text-xs text-slate-500">{match.timestamp}</span> */}
            </div>
          )) : (
            <div className="text-center text-slate-400 p-8">
                <p>Quando você tiver um match, ele aparecerá aqui.</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default ChatScreen;