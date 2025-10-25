'use client';

import { Progress } from '@/components/ui/progress';
import type { Activity } from '@/lib/types';

interface DailySummaryProps {
  activities: Activity[];
}

export function DailySummary({ activities }: DailySummaryProps) {
  const total = activities.length;
  const completed = activities.filter(a => a.completed).length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <h2 className="text-xl font-semibold">Your Day</h2>
        <p className="text-sm font-medium text-muted-foreground">
          {completed} of {total} tasks completed
        </p>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
