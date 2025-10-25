'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { defaultLinks } from './QuickLinksGrid';

type QuickLink = {
  id: string;
  name: string;
  url: string;
};

export function QuickLinks() {
  const [links, setLinks] = useLocalStorage<QuickLink[]>('edenflow-quicklinks-grid', defaultLinks);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<QuickLink | null>(null);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleOpenDialog = (link: QuickLink | null) => {
    setIsEditing(link);
    if (link) {
      setNewName(link.name);
      setNewUrl(link.url.replace(/^https?:\/\//, ''));
    } else {
      setNewName('');
      setNewUrl('');
    }
    setDialogOpen(true);
  };

  const handleSaveLink = () => {
    if (newName.trim() && newUrl.trim()) {
      const urlWithProtocol = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
      if (isEditing) {
        setLinks(links.map(l => l.id === isEditing.id ? { ...l, name: newName, url: urlWithProtocol } : l));
      } else {
        setLinks([...links, { id: crypto.randomUUID(), name: newName, url: urlWithProtocol }]);
      }
      setDialogOpen(false);
    }
  };

  const deleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Quick Links</h4>
        <p className="text-sm text-muted-foreground">Your favorite websites.</p>
      </div>
      <ScrollArea className="h-[200px]">
        <div className="grid gap-2 pr-4">
          {links.map(link => (
            <div key={link.id} className="group flex items-center justify-between">
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:underline">
                <img src={`https://www.google.com/s2/favicons?domain=${link.url}&sz=16`} alt="" width={16} height={16} className="rounded-sm" />
                {link.name}
              </a>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleOpenDialog(link)}>
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => deleteLink(link.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {links.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No links yet.</p>}
        </div>
      </ScrollArea>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full" onClick={() => handleOpenDialog(null)}>
            <Plus className="mr-2 h-4 w-4" /> Add New Link
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit' : 'Add'} Quick Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={newName} onChange={e => setNewName(e.target.value)} className="col-span-3" placeholder="e.g., GitHub" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">URL</Label>
              <Input id="url" value={newUrl} onChange={e => setNewUrl(e.target.value)} className="col-span-3" placeholder="github.com" />
            </div>
          </div>
          <Button onClick={handleSaveLink}>Save Link</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
