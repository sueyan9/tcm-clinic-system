'use client'

import {
    AppBar,
    Toolbar,
    Box,
    InputBase,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Typography,
    Badge,
} from '@mui/material'
import {
    Search as SearchIcon,
    Notifications as NotificationsIcon,
    Person as PersonIcon,
    ArrowDropDown as ArrowDropDownIcon,
    MedicalServices as MedicalServicesIcon,
} from '@mui/icons-material'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'

/**
 * TopBar component - displays top navigation bar with search, notifications, and user menu
 * Fixed at the top of the page, positioned to the right of the sidebar
 */
export default function TopBar() {
    const { user } = useAuth()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    return (
        <AppBar
            position="fixed"
            sx={{
                width: { sm: 'calc(100% - 380px)' },
                ml: { sm: '380px' },
                bgcolor: '#ffffff',
                color: 'text.primary',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
        >
            <Toolbar
                sx={{
                    justifyContent: 'space-between',
                    px: 3,
                    minHeight: '120px !important',
                    height: '120px',
                }}
            >
                {/* Search Bar */}
                <Box
                    sx={{
                        position: 'relative',
                        borderRadius: 2,
                        bgcolor: '#F5F5F5',
                        '&:hover': {
                            bgcolor: '#EEEEEE',
                        },
                        width: { xs: '100%', sm: '400px' },
                        transition: 'background-color 0.2s',
                    }}
                >
                    <Box
                        sx={{
                            padding: '8px 12px',
                            height: '100%',
                            position: 'absolute',
                            pointerEvents: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </Box>
                    <InputBase
                        placeholder="Search for Application here"
                        sx={{
                            color: 'text.primary',
                            width: '100%',
                            pl: '40px',
                            py: 1,
                            '& .MuiInputBase-input': {
                                fontSize: '0.9rem',
                            },
                        }}
                    />
                </Box>

                {/* Right Side Icons and User Menu */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Notifications */}
                    <IconButton
                        sx={{
                            color: 'text.primary',
                            '&:hover': {
                                bgcolor: '#F5F5F5',
                            },
                        }}
                    >
                        <Badge badgeContent={1} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>

                    {/* User Avatar */}
                    {user && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                cursor: 'pointer',
                                '&:hover': {
                                    opacity: 0.8,
                                },
                            }}
                            onClick={handleClick}
                        >
                            <Avatar
                                sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: 'primary.main',
                                }}
                            >
                                {user.firstName.charAt(0)}
                                {user.lastName.charAt(0)}
                            </Avatar>
                        </Box>
                    )}


                    {/* Doctor Icon - Q version from local folder */}
                    <IconButton
                        sx={{
                            color: 'text.primary',
                            '&:hover': {
                                bgcolor: '#F5F5F5',
                            },
                            p: 0.5,
                        }}
                    >
                        <Box
                            component="img"
                            src="/icons/doctor-icon1.png"
                            alt="Doctor"
                            sx={{
                                width: 52,
                                height: 52,
                                objectFit: 'contain',
                            }}
                            onError={(e: any) => {
                                // Fallback to MedicalServices icon if image fails to load
                                e.target.style.display = 'none';
                            }}
                        />
                    </IconButton>
                </Box>

                {/* User Menu Dropdown */}
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    {user && (
                        <MenuItem disabled>
                            <Box>
                                <Typography variant="body2" fontWeight={600}>
                                    {user.firstName} {user.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {user.email}
                                </Typography>
                            </Box>
                        </MenuItem>
                    )}
                    <MenuItem onClick={handleClose}>
                        <Typography variant="body2">Profile Settings</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                        <Typography variant="body2">Account Settings</Typography>
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    )
}

