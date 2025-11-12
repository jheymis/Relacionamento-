import React from 'react';
import { PREMIUM_CHECKOUT_URL } from '../constants';
import { FlameIcon } from './icons';

const PremiumButton = () => {
  return (
    <a
      href={PREMIUM_CHECKOUT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-8 right-4 z-50 flex items-center justify-center bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-full shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out group"
    >
      <span className="p-3">
        <FlameIcon className="w-6 h-6" />
      </span>
      <span className="hidden sm:block text-sm font-semibold pr-4">Seja Premium</span>
    </a>
  );
};

export default PremiumButton;
