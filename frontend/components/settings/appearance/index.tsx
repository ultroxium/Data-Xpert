'use client';
import AppearanceCard from '@/components/settings/appearance/AppearanceCard';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';

const SettingsAppearance = () => {
  return (
    <>
      <h3 className="text-lg font-medium">Appearance Settings</h3>
      <p className="text-sm text-muted-foreground">
        Customize the appearance of your workspace to suit your preferences.
      </p>
      <Separator className="my-4" />
      <AppearanceCard />
    </>
  );
};

export default SettingsAppearance;
