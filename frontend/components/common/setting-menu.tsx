'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useProfile } from '@/hooks/use-profile';
import { useWebSocket } from '@/providers/socket-provider';
import Cookies from 'js-cookie';
import {
  Braces,
  LaptopMinimal,
  LogOut,
  Moon,
  Palette,
  Receipt,
  Settings,
  Sun,
  User
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import { CommonConfirmationAlert } from './common-confirmation';
import { Button } from '../ui/button';

interface SettingsMenuProps {
  isLabel: boolean;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ isLabel }) => {
  const { closeSocket } = useWebSocket();
  const { data: me, isLoading: meLoading, error: profileError } = useProfile();
  const { setTheme } = useTheme();


  const logout = () => {
    closeSocket();
    localStorage.clear();
    Cookies.remove('token');
    // router.push('/login');
    toast('You have been logged out successfully.', {
      position: 'top-right',
      duration: 2000,
    });
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`;
  };

  return (
    <div className="">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="border h-9 w-9 cursor-pointer">
            <AvatarImage src={me?.picture} alt="@shadcn" />
            <AvatarFallback>{me?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="flex flex-col gap-2">
            <DropdownMenuItem className="flex items-center gap-3">
              <User size={15} />
              <div className="flex flex-col">
                <span>Account Settings</span>
                <span className="text-xs text-muted-foreground">{me?.email}</span>
              </div>
            </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Link href={'/settings'}>
          <DropdownMenuItem className="flex items-center gap-3">
            <Settings size={16}/> Settings
          </DropdownMenuItem>
          </Link>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-3">
              <Palette size={16} />
              Appearance
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <LaptopMinimal className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <CommonConfirmationAlert
          component={
            <Button variant={'ghost'} className='flex items-center w-full justify-start px-2 gap-3'>
            <LogOut size={15} className='text-red-500'/>
            Logout
          </Button>
          }
          title="Logout"
          description="Are you sure you want to logout?"
          btnText='yes, logout'
          handleConfirm={logout}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SettingsMenu;
