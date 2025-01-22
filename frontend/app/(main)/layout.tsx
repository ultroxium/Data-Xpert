import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
    title: 'Dashboard | DataXpert',
    description:
        'DataXpert: Connect, preprocess, explore, and visualize data with AI-powered tools for real-time, actionable insights.',
});

export default function OverView({ children }: { children: React.ReactNode }) {
    return<div>
        {children}
    </div>
}
