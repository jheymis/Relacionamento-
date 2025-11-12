import React from 'react';
import { PREMIUM_CHECKOUT_URL } from '../constants';

interface TrialReminderProps {
  daysRemaining: number;
  onDismiss: () => void;
}

const TrialReminder: React.FC<TrialReminderProps> = ({ daysRemaining, onDismiss }) => {
  if (daysRemaining > 3 || daysRemaining <= 0) return null;

  const message = daysRemaining > 1 
    ? `Seu teste grátis termina em ${daysRemaining} dias!` 
    : `Seu teste grátis termina amanhã!`;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-lg bg-slate-800 border border-pink-500 rounded-lg shadow-xl z-50 p-4 animate-fade-in-down">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white">{message}</h3>
          <p className="text-sm text-gray-300">Continue aproveitando todos os benefícios premium.</p>
        </div>
        <div className="flex items-center space-x-2">
            <a href={PREMIUM_CHECKOUT_URL} target="_blank" rel="noopener noreferrer" className="bg-pink-500 text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-pink-600 transition-colors">
            Seja Premium
            </a>
            <button onClick={onDismiss} className="text-gray-400 hover:text-white transition-colors">&times;</button>
        </div>
      </div>
    </div>
  );
};

export default TrialReminder;
