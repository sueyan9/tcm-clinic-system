'use client'

import { useEffect, useState } from 'react'
import {
    Container,
    Typography,
    Paper,
    Box,
    CircularProgress,
} from '@mui/material'
import {
    People as PeopleIcon,
    CalendarToday as CalendarIcon,
    Description as DescriptionIcon,
    Assignment as AssignmentIcon,
} from '@mui/icons-material'
import { SvgIconComponent } from '@mui/icons-material'
import api from '@/lib/api'

/**
 * Dashboard page - displays overview statistics
 * Shows counts for patients, appointments, cases, and ACC applications
 */
export default function Dashboard() {
    const [stats, setStats] = useState({
        patients: 0,
        appointments: 0,
        cases: 0,
        accApplications: 0,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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
        <Box sx={{ p: 3 }}>
            <Container maxWidth="lg">
                {/* Page Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                        Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Hi, welcome to TCM Clinic Management Dashboard
                    </Typography>
                </Box>

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

                {/* Statistics Cards */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(4, 1fr)',
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
                <Box sx={{ mt: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
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
            </Container>
        </Box>
    )
}

