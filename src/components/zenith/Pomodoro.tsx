'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const POMODORO_TIME = 25 * 60;
export const SHORT_BREAK_TIME = 5 * 60;
export const LONG_BREAK_TIME = 15 * 60;

export type SessionType = 'pomodoro' | 'shortBreak' | 'longBreak';

interface PomodoroProps {
  isLarge?: boolean;
}

export function Pomodoro({ isLarge = false }: PomodoroProps) {
  const [time, setTime] = useState(POMODORO_TIME);
  const [isActive, setIsActive] = useState(false);
  const [session, setSession] = useState<SessionType>('pomodoro');
  const [totalTime, setTotalTime] = useState(POMODORO_TIME);

  const audioRef = useRef<HTMLAudioElement | null>(null);

   useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification.mp3');
    }
  }, []);

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const getSessionTime = useCallback((sessionType: SessionType) => {
    switch (sessionType) {
      case 'pomodoro':
        return POMODORO_TIME;
      case 'shortBreak':
        return SHORT_BREAK_TIME;
      case 'longBreak':
        return LONG_BREAK_TIME;
      default:
        return POMODORO_TIME;
    }
  }, []);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0 && isActive) {
      setIsActive(false);
      audioRef.current?.play().catch(e => console.error("Error playing sound:", e));
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time]);
  
  useEffect(() => {
      const newTotalTime = getSessionTime(session);
      setTotalTime(newTotalTime);
      if (!isActive) {
        setTime(newTotalTime);
      }
  }, [session, getSessionTime, isActive]);

  const toggleTimer = () => {
    stopAlarm();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    stopAlarm();
    setIsActive(false);
    setTime(getSessionTime(session));
  };
  
  const handleTabChange = (value: string) => {
    if (!isActive) {
      stopAlarm();
      setSession(value as SessionType);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  const progress = ((totalTime - time) / totalTime) * 100;

  if (isLarge) {
    return (
        <div className="flex flex-col items-center gap-8">
            <div className="relative w-72 h-72 rounded-full flex items-center justify-center text-center shadow-2xl shadow-primary/20 bg-black/20 backdrop-blur-sm border border-white/10">
                <div 
                    className="absolute inset-0 rounded-full transition-all duration-500 -rotate-90"
                    style={{
                        background: `conic-gradient(hsl(var(--accent)) ${progress}%, transparent ${progress}%)`
                    }}
                />
                <div className="absolute w-[90%] h-[90%] bg-black/40 backdrop-blur-2xl rounded-full" />
                <div className="relative">
                    <p className="text-7xl font-bold font-mono tracking-tighter text-shadow">
                        {formatTime(time)}
                    </p>
                    <p className="text-lg text-white/70 capitalize text-shadow-sm">
                      {session === 'pomodoro' ? 'Focus' : session === 'shortBreak' ? 'Short Break' : 'Long Break'}
                    </p>
                </div>
            </div>
             <Tabs value={session} onValueChange={handleTabChange} className="w-full max-w-sm">
                <TabsList className="grid w-full grid-cols-3 bg-black/20 border-white/10 border backdrop-blur-sm">
                  <TabsTrigger value="pomodoro" disabled={isActive} className="data-[state=active]:bg-white/20 data-[state=active]:text-white">Focus</TabsTrigger>
                  <TabsTrigger value="shortBreak" disabled={isActive} className="data-[state=active]:bg-white/20 data-[state=active]:text-white">Short Break</TabsTrigger>
                  <TabsTrigger value="longBreak" disabled={isActive} className="data-[state=active]:bg-white/20 data-[state=active]:text-white">Long Break</TabsTrigger>
                </TabsList>
            </Tabs>
             <div className="flex justify-center gap-4">
                <Button onClick={toggleTimer} className="w-36 h-14 text-xl bg-white/90 text-black hover:bg-white font-bold tracking-wide">
                  {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                  {isActive ? 'Pause' : 'Start'}
                </Button>
                <Button variant="ghost" onClick={resetTimer} className="w-14 h-14 text-lg border-white/10 bg-black/20 hover:bg-black/30 text-white rounded-full">
                  <RotateCcw />
                </Button>
            </div>
        </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Pomodoro Timer</h4>
        <p className="text-sm text-muted-foreground">Focus and take breaks.</p>
      </div>
      
      <Tabs value={session} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pomodoro" disabled={isActive && session !== 'pomodoro'}>Pomodoro</TabsTrigger>
          <TabsTrigger value="shortBreak" disabled={isActive && session !== 'shortBreak'}>Short Break</TabsTrigger>
          <TabsTrigger value="longBreak" disabled={isActive && session !== 'longBreak'}>Long Break</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="text-center">
        <p className="text-6xl font-bold font-mono tracking-tighter">
          {formatTime(time)}
        </p>
      </div>
      <Progress value={progress} />

      <div className="flex justify-center gap-4">
        <Button onClick={toggleTimer} className="w-24">
          {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button variant="outline" onClick={resetTimer}>
          <RotateCcw className="mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}
