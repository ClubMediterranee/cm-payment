import { useEffect, useState } from 'react';

export const useCountdown = (durationSeconds: number, resetKey?: unknown) => {
  const [expiresAt, setExpiresAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setExpiresAt(durationSeconds > 0 ? Date.now() + durationSeconds * 1000 : 0);
    setNow(Date.now());
  }, [durationSeconds, resetKey]);

  const secondsRemaining = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const expired = expiresAt > 0 && secondsRemaining === 0;

  useEffect(() => {
    if (!expiresAt || expired) return undefined;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [expiresAt, expired]);

  return { secondsRemaining, expired };
};
