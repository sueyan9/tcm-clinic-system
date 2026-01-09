'use client'

import { useEffect, useState } from 'react'
import {
    Typography,
    Paper,
    Box,
    CircularProgress,
    Grid,
    IconButton,
    Button,
} from '@mui/material'
import {
    Close as CloseIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
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
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showWelcomeBanner, setShowWelcomeBanner] = useState(true)
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

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
            const [patientsRes, appointmentsRes, casesRes, accRes, appointmentsListRes] = await Promise.all([
                api.get('/api/patients?limit=1'),
                api.get('/api/appointments?limit=1'),
                api.get('/api/cases?limit=1'),
                api.get('/api/acc?limit=1'),
                api.get('/api/appointments').catch(() => ({ data: { appointments: [] } })),
            ])

            setStats({
                patients: patientsRes.data.total || 0,
                appointments: appointmentsRes.data.total || 0,
                cases: casesRes.data.total || 0,
                accApplications: accRes.data.total || 0,
            })
            
            // Set appointments list for calendar
            setAppointments(appointmentsListRes.data.appointments || appointmentsListRes.data || [])
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
     * Get calendar days for current month
     */
    const getCalendarDays = () => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days: (Date | null)[] = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null)
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day))
        }

        return days
    }

    /**
     * Get appointments for a specific date
     */
    const getAppointmentsForDate = (date: Date) => {
        return appointments.filter((appointment) => {
            if (!appointment.appointmentDate) return false
            const appointmentDate = new Date(appointment.appointmentDate)
            return (
                appointmentDate.getDate() === date.getDate() &&
                appointmentDate.getMonth() === date.getMonth() &&
                appointmentDate.getFullYear() === date.getFullYear()
            )
        })
    }

    /**
     * Check if date is today
     */
    const isToday = (date: Date) => {
        const today = new Date()
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    /**
     * Format date for display
     */
    const formatDateDisplay = (date: Date) => {
        return date.toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' })
    }

    /**
     * Check if date has appointments
     */
    const hasAppointments = (date: Date | null) => {
        if (!date) return false
        return getAppointmentsForDate(date).length > 0
    }

    /**
     * Format time for display
     */
    const formatTime = (dateTime: string) => {
        if (!dateTime) return 'N/A'
        const date = new Date(dateTime)
        return date.toLocaleTimeString('en-NZ', {
            hour: '2-digit',
            minute: '2-digit',
        })
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
            elevation={0}
            sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                height: '100%',
                bgcolor: '#ffffff',
                border: '1px solid #f0f0f0',
                borderRadius: 4,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
            }}
        >
            <Box
                sx={{
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: color === 'primary' ? '#e3f2fd' : 
                             color === 'secondary' ? '#f3e5f5' :
                             color === 'success' ? '#e8f5e9' :
                             color === 'warning' ? '#fff3e0' : '#ffebee',
                    color: color === 'primary' ? '#1976d2' : 
                           color === 'secondary' ? '#9c27b0' :
                           color === 'success' ? '#388e3c' :
                           color === 'warning' ? '#f57c00' : '#d32f2f',
                    mb: 2,
                }}
            >
                <Icon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h3" component="div" fontWeight="bold" gutterBottom sx={{ color: '#1d7d81' }}>
                {loading ? <CircularProgress size={24} /> : value.toLocaleString()}
            </Typography>
            <Typography variant="body1" sx={{ color: '#666666' }}>
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
                            borderRadius: 5,
                            background: 'linear-gradient(135deg, rgba(243, 245, 243, 1) 35%, rgba(210, 220, 210, 0.9) 40%, rgba(151, 173, 177, 1) 70%)',
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

                {/* Statistics Cards - Full Width */}
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: 'repeat(2, 1fr)',
                            md: 'repeat(4, 1fr)',
                                    },
                                    gap: 3,
                        mb: 3,
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

                {/* Main Content Grid - Two columns: Reports & Quick Actions, Calendar & Activity */}
                <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
                    {/* Left Column - Reports & Quick Actions */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
                            {/* Reports Section */}
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1.25rem', color: '#fffff' }}>
                                        Reports
                                    </Typography>
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => {
                                            // Navigate to reports page when available
                                            window.location.href = '/reports'
                                        }}
                                        sx={{ textTransform: 'none', color: '#1d7d81',  fontSize: '1rem',fontWeight: 'bold' }}
                                    >
                                        View All
                                    </Button>
                                </Box>
                                <Paper 
                                    sx={{ 
                                        p: 3, 
                                        borderRadius: 4,
                                        boxShadow: 'none',
                                        border: 'none',
                                        bgcolor: '#f5f5f5',
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        minHeight: 0,
                                    }}
                                >
                                <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            borderRadius: 4,
                                            border: '1px solid #f0f0f0',
                                            bgcolor: '#ffffff',
                                            transition: 'all 0.2s',
                                            minHeight: 200,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            '&:hover': {
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                borderColor: '#d0d0d0',
                                            },
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ color: '#000000', mb: 2 }}>
                                            Patient Report
                                        </Typography>
                                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 120 }}>
                                            {[65, 80, 45, 90, 70, 55].map((height, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        width: 24,
                                                        height: `${height}%`,
                                                        bgcolor: '#1d7d81',
                                                        borderRadius: '4px 4px 0 0',
                                                        opacity: 0.8,
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            opacity: 1,
                                                            transform: 'scaleY(1.05)',
                                                        },
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                        <Typography variant="caption" sx={{ color: '#666666', fontSize: '0.75rem', mt: 1, textAlign: 'center' }}>
                                            New patients by month
                                        </Typography>
                                    </Paper>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            borderRadius: 4,
                                            border: '1px solid #f0f0f0',
                                            bgcolor: '#ffffff',
                                            transition: 'all 0.2s',
                                            minHeight: 200,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            '&:hover': {
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                borderColor: '#d0d0d0',
                                            },
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ color: '#000000', mb: 2 }}>
                                            Appointment Report
                                        </Typography>
                                        <Box sx={{ flex: 1, position: 'relative', height: 120 }}>
                                            <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                                                <polyline
                                                    points="10,80 40,60 70,45 100,35 130,50 160,40"
                                                    fill="none"
                                                    stroke="#1d7d81"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                {[80, 60, 45, 35, 50, 40].map((y, index) => (
                                                    <circle
                                                        key={index}
                                                        cx={10 + index * 30}
                                                        cy={y}
                                                        r="4"
                                                        fill="#1d7d81"
                                                    />
                                                ))}
                                            </svg>
                                        </Box>
                                        <Typography variant="caption" sx={{ color: '#666666', fontSize: '0.75rem', mt: 1, textAlign: 'center' }}>
                                            Appointments trend
                                        </Typography>
                                    </Paper>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            borderRadius: 4,
                                            border: '1px solid #f0f0f0',
                                            bgcolor: '#ffffff',
                                            transition: 'all 0.2s',
                                            minHeight: 200,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            '&:hover': {
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                borderColor: '#d0d0d0',
                                            },
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ color: '#000000', mb: 2 }}>
                                            Financial Report
                                        </Typography>
                                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', height: 120 }}>
                                            <Box sx={{ position: 'relative', width: 100, height: 100 }}>
                                                <svg width="100" height="100" viewBox="0 0 100 100">
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="40"
                                                        fill="none"
                                                        stroke="#f0f0f0"
                                                        strokeWidth="8"
                                                    />
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="40"
                                                        fill="none"
                                                        stroke="#1d7d81"
                                                        strokeWidth="8"
                                                        strokeDasharray={`${2 * Math.PI * 40 * 0.75} ${2 * Math.PI * 40}`}
                                                        strokeDashoffset={2 * Math.PI * 40 * 0.25}
                                                        transform="rotate(-90 50 50)"
                                                    />
                                                </svg>
                                                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                                    <Typography variant="h6" sx={{ color: '#1d7d81', fontWeight: 600 }}>
                                                        75%
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Typography variant="caption" sx={{ color: '#666666', fontSize: '0.75rem', mt: 1, textAlign: 'center' }}>
                                            Revenue target progress
                                        </Typography>
                                    </Paper>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            borderRadius: 4,
                                            border: '1px solid #f0f0f0',
                                            bgcolor: '#ffffff',
                                            transition: 'all 0.2s',
                                            minHeight: 200,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            '&:hover': {
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                borderColor: '#d0d0d0',
                                            },
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ color: '#000000', mb: 2 }}>
                                            ACC Report
                                    </Typography>
                                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 120 }}>
                                            {[50, 75, 60, 85, 45, 70].map((height, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        width: 24,
                                                        height: `${height}%`,
                                                        bgcolor: index % 2 === 0 ? '#1d7d81' : '#4a9fa3',
                                                        borderRadius: '4px 4px 0 0',
                                                        opacity: 0.8,
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            opacity: 1,
                                                            transform: 'scaleY(1.05)',
                                                        },
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                        <Typography variant="caption" sx={{ color: '#666666', fontSize: '0.75rem', mt: 1, textAlign: 'center' }}>
                                            ACC applications status
                                    </Typography>
                                    </Paper>
                                </Box>
                                </Paper>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Right Column - Calendar & Activity */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
                            {/* Calendar */}
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1.25rem', color: '#000000' }}>
                                        Calendar
                                    </Typography>
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => {
                                            window.location.href = '/appointments'
                                        }}
                                        sx={{ textTransform: 'none', color: '#1d7d81', fontSize: '1rem', fontWeight:'bold' }}
                                    >
                                        View All
                                    </Button>
                                </Box>
                                <Paper 
                                    sx={{ 
                                        p: 3, 
                                        borderRadius: 4,
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                        bgcolor: '#ffffff',
                                        minHeight: 400,
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    {/* Month/Year Header */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="body1" fontWeight="600" sx={{ color: '#333333' }}>
                                            {formatDateDisplay(currentMonth)}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    const prevMonth = new Date(currentMonth)
                                                    prevMonth.setMonth(prevMonth.getMonth() - 1)
                                                    setCurrentMonth(prevMonth)
                                                }}
                                                sx={{ color: '#1d7d81', p: 0.5 }}
                                            >
                                                <ChevronLeftIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setCurrentMonth(new Date())
                                                }}
                                                sx={{ color: '#1d7d81', p: 0.5 }}
                                            >
                                                <CalendarIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    const nextMonth = new Date(currentMonth)
                                                    nextMonth.setMonth(nextMonth.getMonth() + 1)
                                                    setCurrentMonth(nextMonth)
                                                }}
                                                sx={{ color: '#1d7d81', p: 0.5 }}
                                            >
                                                <ChevronRightIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    {/* Week Days Header */}
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
                                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                                            <Typography
                                                key={day}
                                                variant="caption"
                                                sx={{
                                                    textAlign: 'center',
                                                    fontWeight: 600,
                                                    color: '#666666',
                                                    fontSize: '0.75rem',
                                                }}
                                            >
                                                {day}
                                            </Typography>
                                        ))}
                                    </Box>

                                    {/* Calendar Days Grid */}
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                                        {getCalendarDays().map((date, index) => {
                                            if (!date) {
                                                return <Box key={index} sx={{ aspectRatio: '1' }} />
                                            }
                                            
                                            const dayAppointments = getAppointmentsForDate(date)
                                            const isTodayDate = isToday(date)
                                            const hasAppts = hasAppointments(date)
                                            
                                            return (
                                                <Box
                                                    key={index}
                                                    onClick={() => {
                                                        if (hasAppts) {
                                                            window.location.href = '/appointments'
                                                        }
                                                    }}
                                                    sx={{
                                                        aspectRatio: '1',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        p: 0.5,
                                                        borderRadius: 2,
                                                        bgcolor: isTodayDate 
                                                            ? '#1d7d81' 
                                                            : hasAppts 
                                                                ? 'rgba(29, 125, 129, 0.1)' 
                                                                : 'transparent',
                                                        color: isTodayDate ? '#ffffff' : '#333333',
                                                        cursor: hasAppts ? 'pointer' : 'default',
                                                        transition: 'all 0.2s',
                                                        position: 'relative',
                                                        '&:hover': {
                                                            bgcolor: isTodayDate 
                                                                ? '#1a6d71' 
                                                                : hasAppts 
                                                                    ? 'rgba(29, 125, 129, 0.2)' 
                                                                    : '#f5f5f5',
                                                        },
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: isTodayDate ? 700 : hasAppts ? 600 : 400,
                                                            fontSize: '0.875rem',
                                                        }}
                                                    >
                                                        {date.getDate()}
                                                    </Typography>
                                                    {hasAppts && (
                                                        <Box
                                                            sx={{
                                                                width: 6,
                                                                height: 6,
                                                                borderRadius: '50%',
                                                                bgcolor: isTodayDate ? '#ffffff' : '#1d7d81',
                                                                mt: 0.5,
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            )
                                        })}
                                    </Box>
                                </Paper>
                            </Box>

                            {/* Activity */}
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1.25rem', color: '#000000' }}>
                                        Activity
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ cursor: 'pointer', textTransform: 'none', color: '#1d7d81', fontSize: '1rem',fontWeight: 'bold' }}
                                    >
                                        View All
                                    </Typography>
                                </Box>
                        <Paper 
                            sx={{ 
                                p: 3, 
                                        borderRadius: 4,
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                        bgcolor: '#ffffff',
                                        minHeight: 400,
                                display: 'flex',
                                flexDirection: 'column',
                                    }}
                                >
                            <Box sx={{ flex: 1, overflow: 'auto' }}>
                                        <Typography variant="body2" sx={{ color: '#666666' }}>
                                    Activity feed coming soon
                                </Typography>
                            </Box>
                        </Paper>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </div>
    )
}

