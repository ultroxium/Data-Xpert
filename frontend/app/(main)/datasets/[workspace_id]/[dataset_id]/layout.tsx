import Sidebar from '@/components/common/data-sidebar';
import Topbar from '@/components/common/top-bar';
import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'DataXpert - Data Exploration, Visualization, and Predictive Analytics',
  description:
    'DataXpert: Connect, preprocess, explore, and visualize data with AI-powered tools for real-time, actionable insights.',
});

export default async function OverView({ children }: { children: React.ReactNode}) {
  return (<div className='flex flex-col h-screen'>
    <Topbar/>
    <div className="flex h-[calc(100vh-4rem)]">
      <Sidebar />
      <section className='h-full w-full overflow-auto overflow-x-hidden' style={{ scrollbarWidth: "none" }}>
        {children}
      </section>
    </div>
  </div>);
}
