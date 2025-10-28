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
      <div className="text-center">
         <div className="h-[4.5rem]" />
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
    <div className="text-white text-center space-y-4">
      <p className="opacity-80 text-lg pt-8">{dateString}</p>
      <h1 className="text-7xl md:text-8xl font-bold font-headline tracking-tighter">
        {mainTime}
        <span className="text-2xl md:text-3xl font-normal align-top opacity-70 ml-2 tracking-wide">{ampm.toUpperCase()}</span>
      </h1>
    </div>
  );
}
