'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Activity } from '@/lib/types';
import { format } from 'date-fns';
import { BellRing, Check } from 'lucide-react';
import { useFirebaseApp } from '@/firebase/provider';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';


export function FirebaseTaskNotificationManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const app = useFirebaseApp();
  const { toast } = useToast();

  const tasksCollection = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return collection(firestore, `users/${user.uid}/tasks`);
  }, [firestore, user?.uid]);

  const { data: activities } = useCollection<Activity>(tasksCollection);

  const [dueTask, setDueTask] = useState<Activity | null>(null);
  const notifiedTasksRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);

  // Initialize Firebase Messaging and ask for permissions
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && app) {
      const messaging = getMessaging(app);

      const requestPermission = async () => {
        try {
          if (Notification.permission === 'granted') {
             console.log('Notification permission already granted.');
             setShowPermissionRequest(false);
             // VAPID key is your public key for push notifications
             const currentToken = await getToken(messaging, { vapidKey: 'BNRaLkyj1zJ-Gjt78NKuUFreABo4xLobraOMrWXTKq5QwjXB5sTiK4jBOhbKHu935RWFo6aQvg9IEdowb9YuwWQ' });
             if (currentToken) {
               console.log('FCM Token:', currentToken);
             } else {
               console.log('No registration token available. Request permission to generate one.');
             }
             return;
          }

          if (Notification.permission === 'default') {
            setShowPermissionRequest(true);
          }
          
        } catch (error) {
          console.error('An error occurred while getting notification permission.', error);
        }
      };

      requestPermission();

      // Handle incoming messages when the app is in the foreground
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Message received in foreground.', payload);
        // Show a toast for foreground notifications
        toast({
          title: payload.notification?.title || 'Task Reminder',
          description: payload.notification?.body || 'A task is starting now.',
        });
        audioRef.current?.play().catch(e => console.error("Error playing sound:", e));
      });
      return () => unsubscribe();

    }
  }, [app, toast]);
  
  const handleGrantPermission = async () => {
      if (!app) return;
      const messaging = getMessaging(app);
      try {
        await Notification.requestPermission();
        setShowPermissionRequest(false);
        const currentToken = await getToken(messaging, { vapidKey: 'BNRaLkyj1zJ-Gjt78NKuUFreABo4xLobraOMrWXTKq5QwjXB5sTiK4jBOhbKHu935RWFo6aQvg9IEdowb9YuwWQ' });
        if (currentToken) {
            console.log('FCM Token granted:', currentToken);
        }
      } catch (error) {
          console.error('Failed to get notification permission', error);
          setShowPermissionRequest(false);
      }
  }


  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification.mp3');
    }
  }, []);

  const checkTasks = useCallback(() => {
    // This modal logic is for when the tab is VISIBLE but maybe not in focus.
    // Background notifications are handled by the service worker.
    if (document.visibilityState !== 'visible' || dueTask || !activities) return;

    const currentTime = format(new Date(), 'HH:mm');

    for (const activity of activities) {
      if (
        activity.startTime === currentTime &&
        !activity.completed &&
        !notifiedTasksRef.current.has(activity.id)
      ) {
        setDueTask(activity);
        notifiedTasksRef.current.add(activity.id);
        audioRef.current?.play().catch(e => console.error("Error playing sound:", e));
        break; 
      }
    }
  }, [activities, dueTask]);

  useEffect(() => {
    const intervalId = setInterval(checkTasks, 1000);
    return () => clearInterval(intervalId);
  }, [checkTasks]);

  useEffect(() => {
    const setMidnightReset = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const timeToMidnight = tomorrow.getTime() - now.getTime();

      const timeoutId = setTimeout(() => {
        notifiedTasksRef.current.clear();
        setMidnightReset();
      }, timeToMidnight);

      return () => clearTimeout(timeoutId);
    };

    const clearReset = setMidnightReset();
    return clearReset;
  }, []);
  
  const handleClose = () => {
    setDueTask(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <>
      {showPermissionRequest && (
         <div className="fixed bottom-4 right-4 bg-background border rounded-lg shadow-lg p-4 max-w-sm z-50">
            <h4 className="font-bold">Enable Notifications</h4>
            <p className="text-sm text-muted-foreground mt-1 mb-3">Get alerts for your tasks, even when the app is in the background.</p>
            <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setShowPermissionRequest(false)}>Later</Button>
                <Button size="sm" onClick={handleGrantPermission}>Enable</Button>
            </div>
         </div>
      )}
      <AlertDialog open={!!dueTask} onOpenChange={(open) => !open && handleClose()}>
        <AlertDialogContent className="bg-destructive border-destructive-foreground text-destructive-foreground max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-4 text-3xl">
              <BellRing className="w-12 h-12 animate-pulse" />
              Task Starting Now!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-destructive-foreground/80 pt-4 text-lg">
              It's time for your scheduled activity:
              <p className="font-bold text-2xl text-white mt-2">"{dueTask?.title}"</p>
              <p className="mt-2 text-base">Scheduled for {dueTask?.startTime}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleClose}
              className="bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90 h-12 text-lg"
            >
              <Check className="mr-2" /> Got it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
