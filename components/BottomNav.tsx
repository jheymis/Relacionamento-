import React from 'react';
import { AppScreen } from '../types';
import { FlameIcon, ChatBubbleOvalLeftIcon, UserCircleIcon, HeartIcon } from './icons';

interface BottomNavProps {
  activeScreen: AppScreen;
  setActiveScreen: (screen: AppScreen) => void;
}

// Fix: Define a props interface for NavItem and explicitly type the component as React.FC.
// This helps TypeScript correctly identify it as a React component and handle special
// props like 'key', resolving a type error where 'key' was being passed as a regular prop.
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => {
  const activeClass = 'text-pink-400';
  const inactiveClass = 'text-gray-500 hover:text-pink-400';
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`}>
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};


const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  const navItems = [
    { screen: AppScreen.Discover, label: 'Descobrir', icon: <FlameIcon className="w-7 h-7" /> },
    { screen: AppScreen.Matches, label: 'Matches', icon: <HeartIcon className="w-7 h-7" /> },
    { screen: AppScreen.Chat, label: 'Chat', icon: <ChatBubbleOvalLeftIcon className="w-7 h-7" /> },
    { screen: AppScreen.Profile, label: 'Perfil', icon: <UserCircleIcon className="w-7 h-7" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700 z-40">
      <div className="max-w-md mx-auto h-full grid grid-cols-4 gap-2 items-center px-4">
        {navItems.map((item) => (
          <NavItem
            key={item.screen}
            icon={item.icon}
            label={item.label}
            isActive={activeScreen === item.screen}
            onClick={() => setActiveScreen(item.screen)}
          />
        ))}
      </div>
    </div>
  );
};

export default BottomNav;