'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const commandData = {
  "File System": [
    { cmd: "ls", desc: "List directory contents." },
    { cmd: "cd", desc: "Change the current directory." },
    { cmd: "pwd", desc: "Print name of current/working directory." },
    { cmd: "mkdir", desc: "Create a new directory." },
    { cmd: "rmdir", desc: "Remove an empty directory." },
    { cmd: "rm", desc: "Remove files or directories." },
    { cmd: "cp", desc: "Copy files and directories." },
    { cmd: "mv", desc: "Move or rename files and directories." },
    { cmd: "touch", desc: "Create an empty file or update timestamp." },
    { cmd: "cat", desc: "Concatenate and display file content." },
    { cmd: "less", desc: "View file content one screen at a time." },
    { cmd: "head", desc: "Output the first part of files." },
    { cmd: "tail", desc: "Output the last part of files." },
    { cmd: "find", desc: "Search for files in a directory hierarchy." },
    { cmd: "grep", desc: "Print lines that match patterns." },
  ],
  "Networking": [
    { cmd: "ping", desc: "Send ICMP ECHO_REQUEST to network hosts." },
    { cmd: "ifconfig", desc: "Configure a network interface (deprecated)." },
    { cmd: "ip", desc: "Show / manipulate routing, network devices, interfaces and tunnels." },
    { cmd: "netstat", desc: "Print network connections, routing tables, interface statistics." },
    { cmd: "ss", desc: "Another utility to investigate sockets." },
    { cmd: "traceroute", desc: "Print the route packets trace to network host." },
    { cmd: "nslookup", desc: "Query Internet name servers interactively." },
    { cmd: "dig", desc: "DNS lookup utility." },
    { cmd: "wget", desc: "Non-interactive network downloader." },
    { cmd: "curl", desc: "Transfer a URL." },
    { cmd: "ssh", desc: "OpenSSH SSH client (remote login program)." },
    { cmd: "scp", desc: "Secure copy (remote file copy program)." },
  ],
  "System Information": [
    { cmd: "uname -a", desc: "Print all system information." },
    { cmd: "df -h", desc: "Display free disk space in human-readable format." },
    { cmd: "du -h", desc: "Estimate file space usage in human-readable format." },
    { cmd: "free -h", desc: "Display amount of free and used memory in the system." },
    { cmd: "top", desc: "Display Linux processes." },
    { cmd: "ps aux", desc: "Report a snapshot of the current processes." },
    { cmd: "lscpu", desc: "Display information about the CPU architecture." },
    { cmd: "lsblk", desc: "List block devices." },
    { cmd: "whoami", desc: "Print effective user ID." },
    { cmd: "history", desc: "Display command history." },
  ],
  "Permissions": [
    { cmd: "chmod", desc: "Change file mode bits." },
    { cmd: "chown", desc: "Change file owner and group." },
    { cmd: "sudo", desc: "Execute a command as another user." },
  ]
};

type CommandCategory = keyof typeof commandData;

export function LinuxCommandReference() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = Object.entries(commandData).reduce((acc, [category, commands]) => {
    const filteredCommands = commands.filter(
      c => c.cmd.toLowerCase().includes(searchTerm.toLowerCase()) || c.desc.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredCommands.length > 0) {
      acc[category as CommandCategory] = filteredCommands;
    }
    return acc;
  }, {} as typeof commandData);

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Linux Command Reference</h4>
        <p className="text-sm text-muted-foreground">Quick reference for common commands.</p>
      </div>
      <Input
        placeholder="Search commands..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ScrollArea className="h-[300px] pr-4">
        {Object.keys(filteredData).length > 0 ? (
          <Accordion type="multiple" className="w-full">
            {(Object.keys(filteredData) as CommandCategory[]).map(category => (
              <AccordionItem value={category} key={category}>
                <AccordionTrigger>{category}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {filteredData[category].map(cmd => (
                      <div key={cmd.cmd} className="flex justify-between items-center text-sm">
                        <code className="font-mono bg-muted px-2 py-1 rounded-md">{cmd.cmd}</code>
                        <p className="text-muted-foreground text-right">{cmd.desc}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No commands found matching your search.
          </p>
        )}
      </ScrollArea>
    </div>
  );
}
