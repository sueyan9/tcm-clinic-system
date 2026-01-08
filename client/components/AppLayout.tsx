'use client'

import { Box } from '@mui/material'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

/**
 * AppLayout component - wraps the application with sidebar navigation
 * Only shows sidebar on pages that are not login or public booking pages
 */
export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Pages that should not show the sidebar
    const hideSidebarPages = ['/login']
    const showSidebar = !hideSidebarPages.includes(pathname)

    if (!showSidebar) {
        return <>{children}</>
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: 'background.default',
                    minHeight: '100vh',
                    width: { sm: `calc(100% - 280px)` },
                }}
            >
                {children}
            </Box>
        </Box>
    )
}


