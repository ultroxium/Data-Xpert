import { ProfileForm } from '@/components/settings/Account/profile-form';
import { Separator } from '@/components/ui/separator';
import { constructMetadata } from '@/lib/metadata';


export const metadata = constructMetadata({
  title: 'Settings | Profile',
  description:
    'Get real-time data visualizations and predictive insights with DataXpert, your all-in-one AI-powered data analysis tool.',
});

export default function SettingsProfilePage() {
  return (
    <>
      <h3 className="text-lg font-medium">Profile</h3>
      <p className="text-sm text-muted-foreground">This is how others will see you on the site.</p>
      <Separator className="my-4" />
      <ProfileForm />
    </>
  );
}
