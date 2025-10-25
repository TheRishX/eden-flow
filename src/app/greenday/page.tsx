
'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { Header } from '@/components/greenday/Header';
import { DailySummary } from '@/components/greenday/DailySummary';
import { ActivityList } from '@/components/greenday/ActivityList';
import { AddActivityDialog } from '@/components/greenday/AddActivityDialog';
import { AISuggestionsDialog } from '@/components/greenday/AISuggestionsDialog';
import type { Activity } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';


export default function GreenDayPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [isAddActivityOpen, setAddActivityOpen] = useState(false);
  const [isAISuggestionsOpen, setAISuggestionsOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const tasksCollection = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return collection(firestore, `users/${user.uid}/tasks`);
  }, [firestore, user?.uid]);

  const { data: activities, isLoading: isLoadingActivities } = useCollection<Activity>(tasksCollection);

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setAddActivityOpen(true);
  };

  const handleAddOrUpdateActivity = (activityData: Omit<Activity, 'id' | 'completed' | 'userId' | 'createdAt'>) => {
    if (!tasksCollection || !user?.uid) return;

    if (editingActivity) {
      // Update existing activity
      const taskDoc = doc(firestore, `users/${user.uid}/tasks`, editingActivity.id);
      updateDocumentNonBlocking(taskDoc, activityData);
    } else {
      // Add new activity
      addDocumentNonBlocking(tasksCollection, {
        ...activityData,
        completed: false,
        userId: user?.uid,
        createdAt: serverTimestamp(),
      });
    }
  };

  const addSuggestedActivity = (title: string) => {
    if (!tasksCollection || !user?.uid) return;
    addDocumentNonBlocking(tasksCollection, {
      title,
      startTime: '09:00',
      endTime: '10:00',
      completed: false,
      userId: user?.uid,
      createdAt: serverTimestamp(),
    });
  }

  const toggleActivity = (id: string, completed: boolean) => {
    if (!firestore || !user?.uid) return;
    const taskDoc = doc(firestore, `users/${user.uid}/tasks`, id);
    updateDocumentNonBlocking(taskDoc, { completed: !completed });
  };

  const deleteActivity = (id: string) => {
    if (!firestore || !user?.uid) return;
    const taskDoc = doc(firestore, `users/${user.uid}/tasks`, id);
    deleteDocumentNonBlocking(taskDoc);
  };
  
  const clearCompleted = () => {
    const completedTasks = activities?.filter(act => act.completed) || [];
    completedTasks.forEach(task => {
        deleteActivity(task.id);
    });
  }
  
  const setActivities = (newActivities: Activity[]) => {
     if (!firestore || !user?.uid) return;
     newActivities.forEach((activity) => {
        const taskDoc = doc(firestore, `users/${user.uid}/tasks`, activity.id);
        updateDocumentNonBlocking(taskDoc, { ...activity });
     });
  }
  
  const sortedActivities = activities ? [...activities].sort((a, b) => a.startTime.localeCompare(b.startTime)) : [];
  const completedCount = activities?.filter(a => a.completed).length || 0;

  if (isUserLoading) {
    return (
        <div className="dark bg-background text-foreground min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="dark bg-background text-foreground min-h-screen flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header 
          onAddActivity={() => {
            setEditingActivity(null);
            setAddActivityOpen(true);
          }} 
          onAISuggestions={() => setAISuggestionsOpen(true)}
        />
        <main className="py-8">
          <DailySummary activities={sortedActivities} />

          <div className="mt-8">
             {isLoadingActivities ? (
                <div className="text-center py-16 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                </div>
            ) : (
                <ActivityList 
                  activities={sortedActivities}
                  setActivities={setActivities}
                  onEdit={handleEditActivity}
                  onToggle={(id) => {
                      const activity = activities?.find(a => a.id === id);
                      if (activity) toggleActivity(id, activity.completed);
                  }}
                  onDelete={deleteActivity}
                />
            )}
          </div>
          
          {completedCount > 0 && (
             <div className="mt-8 flex justify-center">
                <Button variant="destructive" onClick={clearCompleted}>
                  Clear Completed Tasks ({completedCount})
                </Button>
            </div>
          )}
        </main>
      </div>

      <AddActivityDialog 
        isOpen={isAddActivityOpen} 
        onOpenChange={setAddActivityOpen}
        onAddActivity={handleAddOrUpdateActivity}
        activity={editingActivity}
      />
      
      <AISuggestionsDialog
        isOpen={isAISuggestionsOpen}
        onOpenChange={setAISuggestionsOpen}
        onAddActivity={addSuggestedActivity}
      />

    </div>
  );
}
