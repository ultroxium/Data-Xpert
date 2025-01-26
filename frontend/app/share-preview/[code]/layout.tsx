import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'Preview',
  description:
    'Unlock AI-powered insights and predictive analytics to make smarter decisions with DataXperts data science platform.',
});

export default function Preview({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
