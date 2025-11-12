import React from 'react';
import { PREMIUM_CHECKOUT_URL } from '../constants';
import { FlameIcon, StarIcon, HeartIcon } from './icons';

const PremiumModal = () => {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-pink-500/50 shadow-2xl p-8 text-center transform transition-all animate-fade-in-up">
        <div className="mx-auto bg-gradient-to-r from-pink-500 to-orange-400 w-16 h-16 rounded-full flex items-center justify-center mb-6">
          <FlameIcon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Seu teste acabou!</h2>
        <p className="text-gray-300 mb-6">
          Para continuar conectando, descobrindo e usando recursos exclusivos, torne-se um membro Premium.
        </p>
        
        <ul className="text-left space-y-3 text-gray-300 mb-8">
          <li className="flex items-center"><HeartIcon className="w-5 h-5 text-pink-400 mr-3" /> Ver quem curtiu você</li>
          <li className="flex items-center"><StarIcon className="w-5 h-5 text-yellow-400 mr-3" /> Super likes ilimitados</li>
          <li className="flex items-center"><FlameIcon className="w-5 h-5 text-orange-400 mr-3" /> Boost no seu perfil</li>
        </ul>

        <a
          href={PREMIUM_CHECKOUT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full block bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-3 px-4 rounded-lg text-lg hover:scale-105 transition-transform duration-300"
        >
          Seja Premium agora 🔥
        </a>
      </div>
    </div>
  );
};

export default PremiumModal;
