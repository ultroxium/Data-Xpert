'use client';
import NotificationsCard from './notifications';
import SettingsMenu from './setting-menu';
import Link from 'next/link';
import { useWorkspace } from '@/hooks/use-workspace';
import InvitePopover from '../dashboard/ShareLink';
import Logo from '../logo';

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
            <Logo/>
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
