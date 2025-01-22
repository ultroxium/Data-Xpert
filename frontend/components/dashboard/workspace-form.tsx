'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePlan } from '@/hooks/use-plan';
import { cn } from '@/lib/utils';
import { CheckIcon, PlusCircleIcon, ChevronDown } from 'lucide-react';
import { Gem, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

export interface Workspace {
  id?: number;
  name: string;
}

const WorkspaceSwitcher = ({
  loadingWorkspaces,
  loadingWorkspace,
  workspacesData,
  mutation,
  workspaceData,
}: any) => {
  const [open, setOpen] = React.useState(false);
  const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] = React.useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = React.useState('');
  const { data: plan, isLoading: planLoading, error: planError } = usePlan();

  const handleAddWorkspace = async () => {
    if (!newWorkspaceName) return;
    const newWorkspace: Workspace = { name: newWorkspaceName };
    await mutation.mutateAsync(newWorkspace);
    setNewWorkspaceName('');
    setShowNewWorkspaceDialog(false);
  };

  const [searchQuery, setSearchQuery] = React.useState('');

  const router = useRouter();
  const pathname = usePathname();

  const HandleWorkspaceName = (id: number, name: string) => {
    if (name === 'Default Workspace') {
      router.push(`${pathname}?wsn=${name}&`);
    } else {
      router.push(`${pathname}?wid=${id}&wsn=${name}`);
    }
  };

  const filteredWorkspaces = workspacesData?.filter((workspace) =>
    workspace?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Dialog open={showNewWorkspaceDialog} onOpenChange={setShowNewWorkspaceDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a workspace"
            className={cn('min-w-[200px] w-full justify-between')}>
            <Avatar className="mr-2 h-5 w-5">
              <AvatarImage
                src={`https://avatar.vercel.sh/abc.png`}
                alt={workspaceData?.name}
                className="grayscale"
              />
              <AvatarFallback>{workspaceData?.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {loadingWorkspace ? 'Loading ...' : workspaceData?.name}
            <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[250px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search workspace..."
              value={searchQuery}
              onInput={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
            <CommandList>
              <CommandEmpty>No workspace found.</CommandEmpty>
              <CommandGroup heading="Default">
                {loadingWorkspaces && (
                  <>
                    {[...Array(1)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full mb-2" />
                    ))}
                  </>
                )}
                {filteredWorkspaces
                  ?.filter((w) => w.name === 'Default Workspace')
                  ?.map((wspace) => (
                    <CommandItem
                      key={wspace.id}
                      onSelect={() => {
                        HandleWorkspaceName(wspace.id, wspace.name);
                        setOpen(false);
                      }}
                      className="text-sm">
                      <Avatar className="mr-2 h-5 w-5">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${wspace.id}.png`}
                          alt={wspace.name}
                          className="grayscale"
                        />
                        <AvatarFallback>{wspace?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {wspace?.name}
                      <CheckIcon
                        className={cn(
                          'ml-auto h-4 w-4',
                          workspaceData?.name === wspace?.name ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
              <CommandGroup heading="Others">
                {loadingWorkspaces && (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full mb-2" />
                    ))}
                  </>
                )}
                {filteredWorkspaces
                  ?.filter((w) => w.name !== 'Default Workspace')
                  ?.map((wspace) => (
                    <CommandItem
                      key={wspace.id}
                      onSelect={() => {
                        HandleWorkspaceName(wspace.id, wspace.name);
                        setOpen(false);
                      }}
                      className="text-sm">
                      <Avatar className="mr-2 h-5 w-5">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${wspace.id}.png`}
                          alt={wspace.name}
                          className="grayscale"
                        />
                        <AvatarFallback>{wspace?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {wspace?.name}
                      <CheckIcon
                        className={cn(
                          'ml-auto h-4 w-4',
                          workspaceData?.name === wspace?.name ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      setShowNewWorkspaceDialog(true);
                    }}>
                    <PlusCircleIcon className="mr-2 h-5 w-5" />
                    Create Workspace
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent>
        <DialogHeader className="flex flex-col items-start">
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>Add a new workspace to manage data.</DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workspace name</Label>
              <Input
                id="name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="New Workspace"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-row items-center justify-end gap-4">
          <Button variant="outline" onClick={() => setShowNewWorkspaceDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddWorkspace}>
            {mutation.isPending ? (
              <>
                <Loader2 className="animate-spin" /> Creating...
              </>
            ) : (
              'Create Workspace'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceSwitcher;
