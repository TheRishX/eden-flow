'use client';

import Image from 'next/image';
import { Clock } from '@/components/zenith/Clock';
import { Greeting } from '@/components/zenith/Greeting';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BrainCircuit, RefreshCcw, Feather, ListTodo, Timer, Notebook, BookOpen, Terminal, Languages, BookCopy, LayoutDashboard, Sun, Loader2 } from 'lucide-react';
import { Focus } from '@/components/zenith/Focus';
import { QuickLinksGrid } from '@/components/zenith/QuickLinksGrid';
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarTrigger,
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Tasks } from '@/components/zenith/Tasks';
import { SettingsMenu } from '@/components/zenith/SettingsMenu';
import { FocusMode } from '@/components/zenith/FocusMode';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { BibleVerse } from '@/components/zenith/BibleVerse';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Pomodoro } from '@/components/zenith/Pomodoro';
import { Search } from '@/components/zenith/Search';
import { InspiringQuote } from '@/components/zenith/InspiringQuote';
import { Scratchpad } from '@/components/zenith/Scratchpad';
import { Dictionary } from '@/components/zenith/Dictionary';
import { Translator } from '@/components/zenith/Translator';
import { LinuxCommandReference } from '@/components/zenith/LinuxCommandReference';
import Link from 'next/link';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


type DailyBackground = {
  url: string;
  date: string; // YYYY-MM-DD
};


export default function ProvidenceTabPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [dailyBg, setDailyBg] = useLocalStorage<DailyBackground | null>('daily-background', null);
  const [focusModeActive, setFocusModeActive] = useState(false);
  
  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  const getNewBgImage = () => `https://picsum.photos/seed/${Date.now()}/1920/1080`;

  useEffect(() => {
    setIsClient(true);
    const today = getTodayDateString();
    
    if (!dailyBg || dailyBg.date !== today) {
      setDailyBg({
        url: getNewBgImage(),
        date: today,
      });
    }
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);
  
  const changeBackground = () => {
    // Manually force a new background image
    setDailyBg({
        url: getNewBgImage(),
        date: getTodayDateString(),
      });
  };

  if (isUserLoading || !user || !isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const bgImage = dailyBg?.url;
  
  const focusModeImage: ImagePlaceholder = {
      id: 'focus-mode-bg',
      imageUrl: bgImage || `https://picsum.photos/1920/1080?random=focus`,
      description: 'Focus mode background',
      imageHint: 'nature landscape'
  };

  return (
    <>
      {focusModeActive && bgImage && (
        <FocusMode onExit={() => setFocusModeActive(false)} bgImage={focusModeImage} />
      )}
      <SidebarProvider>
        <main className="relative w-full h-screen overflow-hidden text-white font-body">
          <ContextMenu>
            <ContextMenuTrigger className="w-full h-full flex">
              {bgImage && (
                <Image
                  key={bgImage}
                  src={bgImage}
                  alt="Dynamic background image"
                  fill
                  className="object-cover -z-20 transition-all duration-1000 ease-in-out"
                  priority
                  data-ai-hint="dynamic background"
                />
              )}
              <div className="absolute inset-0 bg-black/50 -z-10" />

              {isClient ? (
                <div className="flex h-full w-full">
                  <Sidebar collapsible="icon" className="border-r-0 bg-transparent">
                    <SidebarContent className="p-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg m-2">
                      <SidebarHeader>
                          <SidebarTrigger tooltip="Toggle Sidebar" />
                      </SidebarHeader>
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <Link href="/dashboard">
                              <SidebarMenuButton tooltip="Time Management Dashboard">
                                  <LayoutDashboard />
                                  <span>Dashboard</span>
                              </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <SidebarMenuButton tooltip="Focus Mode" onClick={() => setFocusModeActive(true)}>
                            <BrainCircuit />
                            <span>Focus Mode</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <SidebarMenuButton tooltip="To-Do List">
                                        <ListTodo />
                                        <span>To-Do List</span>
                                    </SidebarMenuButton>
                                </PopoverTrigger>
                                <PopoverContent className="w-96 bg-popover text-popover-foreground ml-2">
                                    <Tasks popover={true}/>
                                </PopoverContent>
                            </Popover>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <Popover>
                            <PopoverTrigger asChild>
                              <SidebarMenuButton tooltip="Inspiring Quote">
                                <Feather />
                                <span>Quote</span>
                              </SidebarMenuButton>
                            </PopoverTrigger>
                            <PopoverContent className="w-96 bg-popover text-popover-foreground ml-2">
                              <InspiringQuote />
                            </PopoverContent>
                          </Popover>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <Popover>
                            <PopoverTrigger asChild>
                              <SidebarMenuButton tooltip="Dictionary">
                                <BookOpen />
                                <span>Dictionary</span>
                              </SidebarMenuButton>
                            </PopoverTrigger>
                            <PopoverContent className="w-96 bg-popover text-popover-foreground ml-2">
                              <Dictionary />
                            </PopoverContent>
                          </Popover>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <Popover>
                            <PopoverTrigger asChild>
                              <SidebarMenuButton tooltip="Translator">
                                <Languages />
                                <span>Translator</span>
                              </SidebarMenuButton>
                            </PopoverTrigger>
                            <PopoverContent className="w-96 bg-popover text-popover-foreground ml-2">
                              <Translator />
                            </PopoverContent>
                          </Popover>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <Popover>
                            <PopoverTrigger asChild>
                              <SidebarMenuButton tooltip="Linux Commands">
                                <Terminal />
                                <span>Linux</span>
                              </SidebarMenuButton>
                            </PopoverTrigger>
                            <PopoverContent className="w-96 bg-popover text-popover-foreground ml-2">
                              <LinuxCommandReference />
                            </PopoverContent>
                          </Popover>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <Popover>
                            <PopoverTrigger asChild>
                              <SidebarMenuButton tooltip="Scratchpad">
                                <Notebook />
                                <span>Scratchpad</span>
                              </SidebarMenuButton>
                            </PopoverTrigger>
                            <PopoverContent className="w-96 bg-popover text-popover-foreground ml-2">
                              <Scratchpad />
                            </PopoverContent>
                          </Popover>
                        </SidebarMenuItem>
                      </SidebarMenu>
                      <SidebarFooter className='mt-auto p-2 group-data-[state=collapsed]:hidden'>
                        <Search />
                      </SidebarFooter>
                    </SidebarContent>
                  </Sidebar>

                  <div className="relative z-10 w-full h-full flex flex-col">
                    <header className="absolute top-6 right-8 flex items-start justify-end w-full">
                      <TooltipProvider>
                        <div className="flex items-center gap-4 text-sm bg-black/20 backdrop-blur-sm border border-white/10 p-2 rounded-lg">
                                <Tooltip>
                                   <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/10" asChild>
                                      <Link href="/dashboard">
                                        <LayoutDashboard className="w-4 h-4" />
                                        <span className="sr-only">Dashboard</span>
                                      </Link>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-black/70 text-white border-white/10">
                                    <p>Time Management Dashboard</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/10" asChild>
                                      <Link href="/greenday">
                                        <Sun className="w-4 h-4" />
                                        <span className="sr-only">GreenDay Planner</span>
                                      </Link>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-black/70 text-white border-white/10">
                                    <p>GreenDay Planner</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tasks />
                                <SettingsMenu />
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={changeBackground} className="h-6 w-6 hover:bg-white/10">
                                      <RefreshCcw className="w-4 h-4" />
                                      <span className="sr-only">Change Background</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-black/70 text-white border-white/10">
                                    <p>Change Background</p>
                                  </TooltipContent>
                                </Tooltip>
                        </div>
                      </TooltipProvider>
                    </header>

                    <div className="flex-grow flex flex-col items-center justify-center text-center">
                      <Clock />
                      <Greeting />
                      <Focus />
                      <BibleVerse />
                    </div>
                    
                    <footer className="w-full flex flex-col items-center justify-center gap-4 pb-4">
                      <QuickLinksGrid />
                    </footer>
                  </div>
                </div>
              ) : null}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
              <ContextMenuItem inset onClick={() => {
                  const trigger = document.querySelector('[data-sidebar="menu"] button[tooltip="To-Do List"]');
                  if (trigger instanceof HTMLElement) trigger.click();
              }}>
                <ListTodo className="mr-2 h-4 w-4" />
                <span>New Task</span>
              </ContextMenuItem>
               <ContextMenuItem inset onClick={() => setFocusModeActive(true)}>
                <BrainCircuit className="mr-2 h-4 w-4" />
                <span>Focus Mode</span>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuSub>
                <ContextMenuSubTrigger inset>
                  <BookCopy className="mr-2 h-4 w-4" />
                  <span>References</span>
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-48">
                  <ContextMenuItem onClick={() => {
                    const trigger = document.querySelector('[data-sidebar="menu"] button[tooltip="Dictionary"]');
                    if (trigger instanceof HTMLElement) trigger.click();
                  }}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Dictionary</span>
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => {
                    const trigger = document.querySelector('[data-sidebar="menu"] button[tooltip="Translator"]');
                    if (trigger instanceof HTMLElement) trigger.click();
                  }}>
                    <Languages className="mr-2 h-4 w-4" />
                    <span>Translator</span>
                  </ContextMenuItem>
                   <ContextMenuItem onClick={() => {
                    const trigger = document.querySelector('[data-sidebar="menu"] button[tooltip="Linux Commands"]');
                    if (trigger instanceof HTMLElement) trigger.click();
                  }}>
                    <Terminal className="mr-2 h-4 w-4" />
                    <span>Linux Commands</span>
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSeparator />
               <ContextMenuItem inset onClick={changeBackground}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                <span>Change Background</span>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </main>
      </SidebarProvider>
    </>
  );
}
