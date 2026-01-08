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
} from '@mui/material'
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    CalendarToday as CalendarIcon,
    Description as DescriptionIcon,
    Assignment as AssignmentIcon,
    BookOnline as BookIcon,
    Logout as LogoutIcon,
} from '@mui/icons-material'
import { useAuth } from '@/context/AuthContext'

const drawerWidth = 280

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
                    bgcolor: '#F2F2F2', // Off-white/light gray sidebar background (#F2F2F2)
                    borderRight: '1px solid #CCC1BE',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            {/* Logo/Header Section */}
            <Box
                sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    borderBottom: '1px solid #CCC1BE',
                }}
            >
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'primary.main', // Blue-gray (#456086)
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                    }}
                >
                    TCM
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                        TCM Clinic
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Management System
                    </Typography>
                </Box>
            </Box>

            {/* Navigation Menu */}
            <List sx={{ px: 2, py: 2, flex: 1 }}>
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.path

                    return (
                        <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => handleNavigation(item.path)}
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: isActive ? 'primary.main' : 'transparent',
                                    color: isActive ? '#ffffff' : 'text.primary',
                                    '&:hover': {
                                        bgcolor: isActive ? 'primary.main' : '#CCC1BE', // Light beige/gray hover (#CCC1BE)
                                    },
                                    py: 1.5,
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 40,
                                        color: isActive ? '#ffffff' : 'text.secondary',
                                    }}
                                >
                                    <Icon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontWeight: isActive ? 600 : 400,
                                        fontSize: '0.95rem',
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>

            <Divider sx={{ my: 2 }} />

            {/* User Section */}
            {user && (
                <Box sx={{ px: 2, pb: 2 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: '#F2F2F2', // Off-white/light gray (#F2F2F2)
                        }}
                    >
                        <Avatar
                            sx={{
                                bgcolor: 'secondary.main', // Light orange/peach (#F8BD8D)
                                width: 40,
                                height: 40,
                            }}
                        >
                            {user.firstName.charAt(0)}
                            {user.lastName.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="body2"
                                fontWeight="600"
                                color="text.primary"
                                noWrap
                            >
                                {user.firstName} {user.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {user.role === 'admin' ? 'Administrator' : 'Doctor'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Logout Button - Only show if user is logged in */}
            {user && (
                <Box sx={{ mt: 'auto', p: 2 }}>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            borderRadius: 2,
                            color: 'error.main',
                            '&:hover': {
                                bgcolor: 'error.light',
                                color: 'error.dark',
                            },
                            py: 1.5,
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Logout"
                            primaryTypographyProps={{
                                fontWeight: 500,
                            }}
                        />
                    </ListItemButton>
                </Box>
            )}
        </Drawer>
    )
}

