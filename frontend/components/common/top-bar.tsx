'use client';
import { useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import NotificationsCard from './notifications';
import SettingsMenu from './setting-menu';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CustomTooltip } from './custom-tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useWorkspace } from '@/hooks/use-workspace';
import InvitePopover from '../dashboard/ShareLink';

interface TopbarProps {
  layout?: 'workspace' | 'dataset' | 'settings' | 'dashboard' | 'public';
  title?: string;
  workspaceId?: string;
  datasetId?: string;
}

const Topbar = ({ layout = 'workspace', title = "", workspaceId, datasetId }: TopbarProps) => {
  const { data, isLoading, error } = useWorkspace();

  return (
    <div className="h-16 border-b">
      <div className="h-full flex w-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <div className="w-36 h-16 bg-[url('/logo.png')] dark:bg-[url('/logo_dark.png')] bg-no-repeat bg-center bg-contain" />
          </Link>
        </div>

        {layout === 'workspace' && (
          <div className="flex items-center gap-4">
            {data?.name !== 'Default Workspace' && (
              <InvitePopover data={data}/>
            )}
            <NotificationsCard />
            <SettingsMenu isLabel={false} />
          </div>
        )}

        {layout === 'dataset' && (
          <div className="flex gap-4">
            {data?.name !== 'Default Workspace' && (
              <InvitePopover data={data}/>
            )}
            <NotificationsCard />
            <SettingsMenu isLabel={false} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Topbar;
