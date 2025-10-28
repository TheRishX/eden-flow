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
      <div className="text-center pt-8">
         <div className="h-8" />
         <h1 className="text-6xl md:text-7xl font-bold font-headline tracking-tighter">&nbsp;</h1>
      </div>
    );
  }

  const timeString = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateString = time.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
  
  // Split time into time and AM/PM parts
  const timeParts = timeString.split(' ');
  const mainTime = timeParts[0];
  const ampm = timeParts[1];

  return (
    <div className="text-white text-center pt-8 space-y-4">
      <p className="opacity-80 text-lg">{dateString}</p>
      <h1 className="text-6xl md:text-7xl font-bold font-headline tracking-tighter">
        {mainTime}
        <span className="text-5xl md:text-6xl opacity-70 ml-2">{ampm}</span>
      </h1>
    </div>
  );
}
