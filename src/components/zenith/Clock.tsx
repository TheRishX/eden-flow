'use client';

import { useState, useEffect } from 'react';

export function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
      <div>
         <p className="opacity-80 text-lg">&nbsp;</p>
         <h1 className="text-7xl md:text-8xl font-bold font-headline tracking-tighter -ml-1">&nbsp;</h1>
      </div>
    );
  }

  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateString = time.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="text-white">
      <p className="opacity-80 text-lg">{dateString}</p>
      <h1 className="text-7xl md:text-8xl font-bold font-headline tracking-tighter -ml-1">
        {timeString}
      </h1>
    </div>
  );
}
