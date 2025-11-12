import { useState, useEffect, useCallback } from 'react';

const TRIAL_DURATION_DAYS = 7;
const TRIAL_START_KEY = 'aura_trial_start_date';

export const useTrial = () => {
  const [trialStartDate, setTrialStartDate] = useState<number | null>(null);
  const [isTrialActive, setIsTrialActive] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(TRIAL_DURATION_DAYS);
  const [showReminder, setShowReminder] = useState(false);

  const getTrialStartDate = useCallback((): number => {
    const storedDate = localStorage.getItem(TRIAL_START_KEY);
    if (storedDate) {
      return parseInt(storedDate, 10);
    }
    const now = Date.now();
    localStorage.setItem(TRIAL_START_KEY, now.toString());
    return now;
  }, []);

  useEffect(() => {
    const startDate = getTrialStartDate();
    setTrialStartDate(startDate);

    const checkTrialStatus = () => {
      const now = Date.now();
      const trialEndDate = startDate + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;
      
      if (now > trialEndDate) {
        setIsTrialActive(false);
        setDaysRemaining(0);
        setShowReminder(false);
      } else {
        const remainingTime = trialEndDate - now;
        const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
        setDaysRemaining(remainingDays);
        setIsTrialActive(true);

        // Show reminders on days 5, 6, and 7 (i.e., when 3, 2, or 1 days are remaining)
        if (remainingDays <= 3) {
          setShowReminder(true);
        }
      }
    };
    
    checkTrialStatus();
    const interval = setInterval(checkTrialStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [getTrialStartDate]);

  return { isTrialActive, daysRemaining, showReminder };
};
