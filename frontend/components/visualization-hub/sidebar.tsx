import Link from 'next/link'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from '@/components/ui/sidebar'

import Logo from '../logo'
import { Github } from 'lucide-react'

export function VisualizationHubSidebar() {
    return (
        <Sidebar>
            <SidebarHeader className="px-4 h-16 flex items-start justify-center">
                <Link href="/">
                    <Logo />
                </Link>
            </SidebarHeader>
            <SidebarContent className="py-4">
                <SidebarMenu className="space-y-4">
                    <SidebarMenuItem className="px-4">
                       
                    </SidebarMenuItem>

                

                    
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
                <Github size={16}/>
            </SidebarFooter>
        </Sidebar>
    )
}

