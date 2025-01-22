import SecurityPage from '@/components/settings/security';
import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'Settings | Security',
  description:
    'Empowering businesses with DataXpert’s AI-driven data insights, predictive analytics, and interactive data visualization.  ',
});

export default function Plans() {
  return <SecurityPage />;
}
