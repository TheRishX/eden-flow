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

  const timeString = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateString = time.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="text-white">
      <p className="opacity-80 text-lg">{dateString}</p>
      <h1 className="text-7xl md:text-8xl font-bold font-headline tracking-tighter -ml-1">
        {timeString.replace(' AM', '').replace(' PM', '')}
        <span className="text-5xl md:text-6xl align-top text-white/80 ml-2">
            {time.getHours() >= 12 ? 'PM' : 'AM'}
        </span>
      </h1>
    </div>
  );
}
