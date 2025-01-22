import SettingsAppearance from '@/components/settings/appearance';
import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'Settings | Appearance',
  description:
    'DataXpert: AI-powered data exploration, interactive visualizations, predictive modeling, and real-time insights for data-driven decisions.',
});

export default function Appearance() {
  return <SettingsAppearance />;
}
