'use client'

import { useEffect, useState } from 'react'
import {
    Typography,
    Paper,
    Box,
    CircularProgress,
    Grid,
    IconButton,
} from '@mui/material'
import {
    Close as CloseIcon,
} from '@mui/icons-material'
import {
    People as PeopleIcon,
    CalendarToday as CalendarIcon,
    Description as DescriptionIcon,
    Assignment as AssignmentIcon,
    AccessTime as AccessTimeIcon,
} from '@mui/icons-material'
import { SvgIconComponent } from '@mui/icons-material'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

/**
 * Dashboard page - displays overview statistics
 * Shows counts for patients, appointments, cases, and ACC applications
 */
export default function Dashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        patients: 0,
        appointments: 0,
        cases: 0,
        accApplications: 0,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showWelcomeBanner, setShowWelcomeBanner] = useState(true)

    useEffect(() => {
        fetchStats()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /**
     * Fetch statistics from the API
     * Calls multiple endpoints to get counts for each category
     */
    const fetchStats = async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch data from multiple endpoints in parallel
            const [patientsRes, appointmentsRes, casesRes, accRes] = await Promise.all([
                api.get('/api/patients?limit=1'),
                api.get('/api/appointments?limit=1'),
                api.get('/api/cases?limit=1'),
                api.get('/api/acc?limit=1'),
            ])

            setStats({
                patients: patientsRes.data.total || 0,
                appointments: appointmentsRes.data.total || 0,
                cases: casesRes.data.total || 0,
                accApplications: accRes.data.total || 0,
            })
        } catch (err: any) {
            console.error('Error fetching stats:', err)
            // If API is not available, show 0 for all stats
            setError('Unable to fetch statistics. Please ensure the backend server is running.')
            setStats({
                patients: 0,
                appointments: 0,
                cases: 0,
                accApplications: 0,
            })
        } finally {
            setLoading(false)
        }
    }

    /**
     * StatCard component - displays a single statistic
     * @param title - The label for the statistic
     * @param value - The numeric value to display
     * @param icon - Material-UI icon component
     * @param color - Color theme for the card
     */
    const StatCard = ({
                          title,
                          value,
                          icon: Icon,
                          color = 'primary',
                      }: {
        title: string
        value: number
        icon: SvgIconComponent
        color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
    }) => (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                },
            }}
        >
            <Box
                sx={{
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: `${color}.light`,
                    color: `${color}.main`,
                    mb: 2,
                }}
            >
                <Icon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h3" component="div" fontWeight="bold" gutterBottom>
                {loading ? <CircularProgress size={24} /> : value.toLocaleString()}
            </Typography>
            <Typography variant="body1" color="text.secondary">
                {title}
            </Typography>
        </Paper>
    )

    return (
        <div style={{ 
            width: '100%', 
            backgroundColor: '#F2F2F2', 
            minHeight: '100%', 
            padding: 0,
            margin: 0,
            marginLeft: '-380px',
            paddingLeft: '380px',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Div 1: Dashboard Title */}
            <Box 
                sx={{ 
                    width: '100vw', // Full viewport width
                    ml: '-380px', // Negative margin to extend to sidebar edge
                    pl: '380px', // Padding to align content with TopBar
                    bgcolor: '#ffffff',
                    height: '120px', // Same height as TopBar
                    display: 'flex',
                    flexDirection: 'column', // Vertical layout
                    justifyContent: 'center', // Center vertically
                    px: 3,
                    borderRadius: 0,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    mx: 0,
                }}
            >
                <Typography
                    variant="h3"
                    component="h3"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{
                        fontSize: '2.3rem',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        letterSpacing: '-0.01em',
                    }}
                >
                    Dashboard
                </Typography>
                {/*<Typography variant="h4" component="h3" fontWeight="bold" sx={{ mb: 0.5 }}>*/}
                {/*    Dashboard*/}
                {/*</Typography>*/}
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0 }}>
                    Hi, welcome to TCM Clinic Management Dashboard
                </Typography>
            </Box>

            {/* Div 2: Main Content Area */}
            <Box sx={{ px: 3, py: 3, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {/* Welcome Banner */}
                {showWelcomeBanner && (
                    <Paper
                        sx={{
                            mb: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(243, 245, 243, 1) 0%, rgba(243, 245, 243, 0.9) 30%, rgba(200, 230, 240, 0.8) 100%)',
                            backdropFilter: 'blur(8px)',
                            position: 'relative',
                            overflow: 'visible',
                            p: 0,
                            minHeight: '320px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                position: 'relative',
                                minHeight: '320px',
                            }}
                        >
                            {/* Left Side - Illustration (悬浮在五分之二处) */}
                            <Box
                                sx={{
                                    flex: '0 0 350px',
                                    height: '320px',
                                    minHeight: '320px',
                                    position: 'relative',
                                    display: { xs: 'none', md: 'block' },
                                    zIndex: 1,
                                    overflow: 'visible',
                                }}
                            >
                                <Box
                                    component="img"
                                    src="/icons/welcome-illustration.png"
                                    alt="Welcome"
                                    sx={{
                                        position: 'absolute',
                                        width: 'auto',
                                        height: '320px',
                                        maxWidth: '350px',
                                        objectFit: 'contain',
                                        objectPosition: 'left center',
                                        top: '50%', // 五分之二处 = 40%
                                        transform: 'translateY(-50%)',
                                        left: 20,
                                        zIndex: 2,
                                        display: 'block',
                                        opacity: 0.9,
                                        mixBlendMode: 'multiply',
                                    }}
                                    onError={(e: any) => {
                                        // Show placeholder if image doesn't exist
                                        const placeholder = e.target.nextElementSibling;
                                        if (placeholder) {
                                            placeholder.style.display = 'flex';
                                        }
                                        e.target.style.display = 'none';
                                    }}
                                />
                                {/* Placeholder if image doesn't exist */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        display: 'none', // Hidden by default, shown when image fails
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        top: '40%',
                                        transform: 'translateY(-30%)',
                                        left: 10,
                                        zIndex: 1,
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.5 }}>
                                        Illustration placeholder
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Right Side - Text Content */}
                            <Box
                                sx={{
                                    flex: 1,
                                    p: 4,
                                    pl: { md: 30 }, // More left padding to move text to the right
                                    pr: { md: 6 }, // Right padding for spacing
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: { md: 'flex-start' }, // Align text to the right
                                    position: 'relative',
                                    zIndex: 0, // Lower z-index so image can appear above
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 1 }}
                                >
                                    {user ? `Hi, ${user.firstName} ${user.lastName}` : 'Hi, Guest'}
                                </Typography>
                                <Typography
                                    variant="h4"
                                    component="h2"
                                    fontWeight="bold"
                                    color="text.primary"
                                    sx={{ mb: 2 }}
                                >
                                    Welcome to Management
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ lineHeight: 1.6 }}
                                >
                                    Project activity will be updated here. Click on the name section to set your configuration.
                                </Typography>
                            </Box>

                            {/* Close Button */}
                            <IconButton
                                onClick={() => setShowWelcomeBanner(false)}
                                sx={{
                                    position: 'absolute',
                                    top: 12,
                                    right: 12,
                                    color: 'text.secondary',
                                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 1)',
                                    },
                                    zIndex: 2,
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Paper>
                )}

                {/* Error Message */}
                {error && (
                    <Paper
                        sx={{
                            p: 2,
                            mb: 3,
                            bgcolor: 'error.light',
                            color: 'error.dark',
                        }}
                    >
                        <Typography variant="body2">{error}</Typography>
                    </Paper>
                )}

                {/* Main Content Grid - Three columns: Main Content, Calendar, Activity */}
                <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
                    {/* Left Column - Main Content */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
                            {/* Statistics Cards */}
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: 'repeat(2, 1fr)',
                                    },
                                    gap: 3,
                                }}
                            >
                                <StatCard
                                    title="Total Patients"
                                    value={stats.patients}
                                    icon={PeopleIcon}
                                    color="primary"
                                />
                                <StatCard
                                    title="Appointments"
                                    value={stats.appointments}
                                    icon={CalendarIcon}
                                    color="secondary"
                                />
                                <StatCard
                                    title="Case Records"
                                    value={stats.cases}
                                    icon={DescriptionIcon}
                                    color="success"
                                />
                                <StatCard
                                    title="ACC Applications"
                                    value={stats.accApplications}
                                    icon={AssignmentIcon}
                                    color="warning"
                                />
                            </Box>

                            {/* Additional Content Area */}
                            <Box sx={{ flex: 1 }}>
                                <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                                    <Typography variant="h6" gutterBottom fontWeight="600">
                                        Welcome to TCM Clinic Management System
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        This system helps you manage patients, appointments, case records, and ACC
                                        applications for your Traditional Chinese Medicine clinic in New Zealand.
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Use the navigation menu on the left to access different sections of the system.
                                    </Typography>
                                </Paper>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Middle Column - Calendar */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Paper 
                            sx={{ 
                                p: 3, 
                                borderRadius: 2,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: 0,
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="600">
                                    Calender
                                </Typography>
                            </Box>
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Calendar widget coming soon
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Right Column - Activity */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Paper 
                            sx={{ 
                                p: 3, 
                                borderRadius: 2,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: 0,
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="600">
                                    Activity
                                </Typography>
                                <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                                    View All
                                </Typography>
                            </Box>
                            <Box sx={{ flex: 1, overflow: 'auto' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Activity feed coming soon
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </div>
    )
}

