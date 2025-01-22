import { SidebarNav } from '@/components/settings/sidebar-nav';
import { CircleUser, Palette, Receipt, Shield } from 'lucide-react';
import { constructMetadata } from '@/lib/metadata';
import Topbar from '@/components/common/top-bar';


export const metadata = constructMetadata({
  title: 'Settings',
  description:
    'DataXpert combines AI with data science tools for fast data exploration, intelligent preprocessing, and accurate predictions.',
});

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/settings',
    icon: <CircleUser size={16} />,
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
    icon: <Palette size={16} />,
  },
  {
    title: 'Account',
    href: '/settings/security',
    icon: <Shield size={16} />,
  }
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="flex h-screen w-screen flex-col">
      <Topbar layout='settings'/>
      <div className="container flex">
        <aside className="h-[calc(100vh-4rem)] w-[20%] border-r py-8 pr-8 ">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="h-full flex-1 py-8 px-8">{children}</div>
      </div>
    </div>
  );
}
