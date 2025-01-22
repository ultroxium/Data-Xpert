import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

const AppearanceCard = () => {
  const [activeTheme, setActiveTheme] = useState('system'); // State to track active theme
  const { setTheme, resolvedTheme } = useTheme(); // Get the current resolved theme

  useEffect(() => {
    // Retrieve active theme from local storage on mount
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setActiveTheme(storedTheme);
    }
  }, []);
  const handleThemeChange = (theme: string) => {
    setTheme(theme);
    setActiveTheme(theme);
    localStorage.setItem('theme', theme); // Store theme preference in local storage
    // toast('Theme Changed successfully.', {
    //   type: 'success',
    //   position: 'bottom-left',
    //   duration: 1000
    // });
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-start w-full gap-4">
      <Card
        onClick={() => handleThemeChange('light')}
        className={
          activeTheme === 'light' ? 'border border-primary w-[250px] ' : 'w-[250px] shadow-none '
        }>
        <CardHeader className="h-[150px]">
          <CardTitle className="text-xl font-semibold">Light Mode</CardTitle>
          <CardDescription>Switch to light mode for a brighter experience.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
            <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
              <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card
        onClick={() => handleThemeChange('dark')}
        className={
          activeTheme === 'dark' ? 'border border-primary w-[250px] ' : 'w-[250px] shadow-none '
        }>
        <CardHeader className="h-[150px]">
          <CardTitle className="text-xl font-semibold">Dark Mode</CardTitle>
          <CardDescription>Switch to dark mode for a darker experience.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
            <div className="space-y-2 rounded-sm bg-slate-950 p-2">
              <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-slate-400" />
                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-slate-400" />
                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card
        onClick={() => handleThemeChange('system')}
        className={
          activeTheme === 'system' ? 'border border-primary w-[250px] ' : 'w-[250px] shadow-none '
        }>
        <CardHeader className="h-[150px]">
          <CardTitle className="text-xl font-semibold">System Preference</CardTitle>
          <CardDescription>Switch to System Preference.</CardDescription>
        </CardHeader>
        <CardContent>
          {activeTheme === 'light' ? (
            <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
              <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                  <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                </div>
              </div>
            </div>
          ) : (
            <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
              <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-slate-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-slate-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearanceCard;
