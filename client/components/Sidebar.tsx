'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Typography,
    Divider,
    Avatar,
    IconButton,
} from '@mui/material'
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    CalendarToday as CalendarIcon,
    Description as DescriptionIcon,
    Assignment as AssignmentIcon,
    BookOnline as BookIcon,
    Logout as LogoutIcon,
    ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'
import { useAuth } from '@/context/AuthContext'

const drawerWidth = 380

/**
 * Navigation menu items configuration
 */
const menuItems = [
    { text: 'Dashboard', icon: DashboardIcon, path: '/' },
    { text: 'Patients', icon: PeopleIcon, path: '/patients' },
    { text: 'Appointments', icon: CalendarIcon, path: '/appointments' },
    { text: 'Case Records', icon: DescriptionIcon, path: '/cases' },
    { text: 'ACC Applications', icon: AssignmentIcon, path: '/acc' },
    { text: 'Book Appointment', icon: BookIcon, path: '/book' },
]

/**
 * Sidebar component - provides navigation for the application
 * Displays menu items, user info, and logout button
 */
export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { user, logout } = useAuth()

    /**
     * Handle navigation to a different page
     */
    const handleNavigation = (path: string) => {
        router.push(path)
    }

    /**
     * Handle logout action
     */
    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    bgcolor: '#F2F2F2', // Light grey sidebar background
                    borderRight: '1px solid #E0E0E0',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    height: '100vh',
                    top: 0,
                    left: 0,
                },
            }}
        >
            {/* Logo/Header Section */}
            <Box
                sx={{
                    p: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2.5,
                    borderBottom: '1px solid #E0E0E0',
                }}
            >
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        bgcolor: '#000000', // Black cube icon
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontSize: '1.25rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                >
                    M
                </Box>
                <Box>
                    <Typography 
                        variant="h6" 
                        fontWeight="bold" 
                        color="text.primary"
                        sx={{ 
                            fontSize: '1.3rem',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            letterSpacing: '-0.01em',
                        }}
                    >
                       Management
                    </Typography>
                   
                </Box>
            </Box>

            {/* Navigation Menu */}
            <List sx={{ px: 3, py: 3, flex: 1 }}>
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.path

                    return (
                        <ListItem key={item.path} disablePadding sx={{ mb: 1.5 }}>
                            <ListItemButton
                                onClick={() => handleNavigation(item.path)}
                                sx={{
                                    borderRadius: 2.5,
                                    bgcolor: isActive ? '#EAEAEA' : 'transparent', // Light grey background for active item
                                    color: 'text.primary',
                                    '&:hover': {
                                        bgcolor: isActive ? '#EAEAEA' : 'rgba(0, 0, 0, 0.05)',
                                    },
                                    py: 2,
                                    px: 2,
                                    position: 'relative',
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 48,
                                        color: isActive ? 'text.primary' : 'text.secondary',
                                    }}
                                >
                                    <Icon sx={{ fontSize: 26 }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontWeight: isActive ? 600 : 500,
                                        fontSize: '1.15rem',
                                        color: 'text.primary',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                        letterSpacing: '-0.01em',
                                    }}
                                />
                                {isActive && (
                                    <IconButton
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            right: 12,
                                            bgcolor: '#ffffff',
                                            color: 'text.primary',
                                            width: 28,
                                            height: 28,
                                            '&:hover': {
                                                bgcolor: '#f5f5f5',
                                            },
                                        }}
                                    >
                                        <ChevronRightIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                )}
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>

            <Divider sx={{ my: 2, borderColor: '#E0E0E0' }} />

            {/* Logout Button - Only show if user is logged in */}
            {user && (
                <Box sx={{ mt: 'auto', p: 3 }}>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            borderRadius: 2.5,
                            color: 'text.primary',
                            '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.05)',
                            },
                            py: 2,
                            px: 2,
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 48, color: 'text.secondary' }}>
                            <LogoutIcon sx={{ fontSize: 26 }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Logout"
                            primaryTypographyProps={{
                                fontWeight: 500,
                                fontSize: '1.15rem',
                                color: 'text.primary',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                letterSpacing: '-0.01em',
                            }}
                        />
                    </ListItemButton>
                </Box>
            )}
        </Drawer>
    )
}

