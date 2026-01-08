'use client'

import { Box } from '@mui/material'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

/**
 * AppLayout component - wraps the application with sidebar navigation and top bar
 * Only shows sidebar and top bar on pages that are not login or public booking pages
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
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F2F2F2' }}>
            {/* Sidebar Navigation - Fixed on the left */}
            <Sidebar />

            {/* Main Content Area with Top Bar */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: '#F2F2F2',
                    minHeight: '100vh',
                    width: '100%',
                    ml: 0, // No left margin, sidebar is fixed
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Top Bar - Fixed at the top, positioned to the right of sidebar */}
                <TopBar />

                {/* Content Area - Below the top bar, flush with sidebar */}
                <Box
                    sx={{
                        flexGrow: 1,
                        pt: '64px', // Height of AppBar/Toolbar
                        bgcolor: '#F2F2F2',
                        minHeight: 'calc(100vh - 64px)',
                        width: '100%',
                        ml: 0,
                        mr: 0,
                        pl: 0, // No padding here, handled in children
                        pr: 0,
                        mt: 0,
                        mb: 0,
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    )
}


