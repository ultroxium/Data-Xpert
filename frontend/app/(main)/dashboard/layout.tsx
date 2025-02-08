import { SidebarProvider } from '@/components/ui/sidebar';
import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'DataXpert | Workspace',
  description:
    'Transform your data with DataXpert – AI tools for data exploration, visualization, model building, and real-time predictions.',
});

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <>
    <SidebarProvider>
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
    </SidebarProvider>
  </>;
}
