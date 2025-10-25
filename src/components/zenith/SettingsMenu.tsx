'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Link, Clock } from 'lucide-react';
import { Pomodoro } from './Pomodoro';
import { QuickLinks } from './QuickLinks';

export function SettingsMenu() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/10">
          <Settings className="w-4 h-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 bg-popover text-popover-foreground mr-4">
        <Tabs defaultValue="links">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pomodoro">
              <Clock className="w-4 h-4 mr-2" />
              Timer
            </TabsTrigger>
            <TabsTrigger value="links">
              <Link className="w-4 h-4 mr-2" />
              Links
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pomodoro" className="pt-4">
            <Pomodoro />
          </TabsContent>
          <TabsContent value="links" className="pt-4">
            <QuickLinks />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
