'use client'

import React, { useEffect, useState } from 'react'
import {
    Typography,
    Paper,
    Box,
    Button,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    CircularProgress,
    Grid,
    Divider,
    Menu,
    MenuItem,
    Card,
    CardContent,
} from '@mui/material'
import {
    Add as AddIcon,
    Search as SearchIcon,
    CalendarToday as CalendarIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    VideoCall as VideoCallIcon,
    EventAvailable as EventAvailableIcon,
} from '@mui/icons-material'
import api from '@/lib/api'

type ViewMode = 'day' | 'week' | 'month' | 'year'
type RightPanelMode = 'today' | 'selected'

/**
 * Appointments page - displays calendar view and appointment details
 * Shows calendar with appointments marked, and list of appointments for selected date
 */
export default function Appointments() {
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
    const [viewMode, setViewMode] = useState<ViewMode>('month')
    const [viewModeAnchor, setViewModeAnchor] = useState<null | HTMLElement>(null)
    const [datePickerAnchor, setDatePickerAnchor] = useState<null | HTMLElement>(null)

    // ✅ Right panel: default shows today's appointments, switch to selected date when user clicks a day
    const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('today')

    useEffect(() => {
        fetchAppointments()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /**
     * Fetch appointments from the API
     */
    const fetchAppointments = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await api.get('/api/appointments')
            setAppointments(response.data.appointments || response.data || [])
        } catch (err: any) {
            console.error('Error fetching appointments:', err)
            setError('Unable to fetch appointments. Please ensure the backend server is running.')
            setAppointments([])
        } finally {
            setLoading(false)
        }
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
     * Check if a date has appointments
     */
    const hasAppointments = (date: Date) => {
        return getAppointmentsForDate(date).length > 0
    }

    /**
     * Get today's upcoming appointments (sorted)
     */
    const getTodayAppointments = () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        return appointments
            .filter((appointment) => {
                if (!appointment.appointmentDate) return false
                const appointmentDate = new Date(appointment.appointmentDate)
                return appointmentDate >= today && appointmentDate < tomorrow
            })
            .sort((a, b) => {
                const timeA = a.appointmentDate || ''
                const timeB = b.appointmentDate || ''
                return timeA.localeCompare(timeB)
            })
    }

    /**
     * Get status color for chip
     */
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
            case 'scheduled':
                return 'success'
            case 'pending':
                return 'warning'
            case 'cancelled':
                return 'error'
            case 'completed':
                return 'info'
            default:
                return 'default'
        }
    }

    /**
     * Format date and time
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
     * Format date
     */
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-NZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    /**
     * Format date for display in filter button
     * (keeping your original behavior; you can refine later if you want month/week display)
     */
    const formatDateDisplay = () => {
        const monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ]
        return `${monthNames[currentMonth.getMonth()]} ${currentMonth.getDate()}`
    }

    /**
     * Format view mode for display
     */
    const formatViewMode = (mode: ViewMode) => {
        return mode.charAt(0).toUpperCase() + mode.slice(1)
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
     * Navigate to previous period
     */
    const handlePrevious = () => {
        const newDate = new Date(currentMonth)
        switch (viewMode) {
            case 'day':
                newDate.setDate(newDate.getDate() - 1)
                break
            case 'week':
                newDate.setDate(newDate.getDate() - 7)
                break
            case 'month':
                newDate.setMonth(newDate.getMonth() - 1)
                break
            case 'year':
                newDate.setFullYear(newDate.getFullYear() - 1)
                break
        }
        setCurrentMonth(newDate)
    }

    /**
     * Navigate to next period
     */
    const handleNext = () => {
        const newDate = new Date(currentMonth)
        switch (viewMode) {
            case 'day':
                newDate.setDate(newDate.getDate() + 1)
                break
            case 'week':
                newDate.setDate(newDate.getDate() + 7)
                break
            case 'month':
                newDate.setMonth(newDate.getMonth() + 1)
                break
            case 'year':
                newDate.setFullYear(newDate.getFullYear() + 1)
                break
        }
        setCurrentMonth(newDate)
    }

    /**
     * Navigate to today
     */
    const handleToday = () => {
        const today = new Date()
        setCurrentMonth(today)
        setSelectedDate(today)
        setRightPanelMode('today') // ✅ reset right panel back to Today
    }

    /**
     * Navigate to previous month
     */
    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    }

    /**
     * Navigate to next month
     */
    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    }

    /**
     * Handle view mode menu
     */
    const handleViewModeClick = (event: React.MouseEvent<HTMLElement>) => {
        setViewModeAnchor(event.currentTarget)
    }

    const handleViewModeClose = (mode?: ViewMode) => {
        if (mode) {
            setViewMode(mode)
        }
        setViewModeAnchor(null)
    }

    /**
     * Handle date picker menu
     */
    const handleDatePickerClick = (event: React.MouseEvent<HTMLElement>) => {
        setDatePickerAnchor(event.currentTarget)
    }

    const handleDatePickerClose = () => {
        setDatePickerAnchor(null)
    }

    /**
     * Handle add event
     */
    const handleAddEvent = () => {
        window.location.href = '/book'
    }

    /**
     * Check if date is today
     */
    const isToday = (date: Date | null) => {
        if (!date) return false
        const today = new Date()
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    /**
     * Check if date is selected
     */
    const isSelected = (date: Date | null) => {
        if (!date) return false
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        )
    }

    const calendarDays = getCalendarDays()
    const monthName = currentMonth.toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' })
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    // ✅ right panel data (default today; after selecting date -> selected date)
    const rightPanelDate = rightPanelMode === 'today' ? new Date() : selectedDate

    const rightPanelAppointments = getAppointmentsForDate(rightPanelDate)
        .filter((appointment) => {
            if (!searchTerm) return true
            const searchLower = searchTerm.toLowerCase()
            return (
                appointment.patientName?.toLowerCase().includes(searchLower) ||
                appointment.patientEmail?.toLowerCase().includes(searchLower) ||
                appointment.notes?.toLowerCase().includes(searchLower)
            )
        })
        .sort((a, b) => {
            const timeA = a.appointmentDate || ''
            const timeB = b.appointmentDate || ''
            return timeA.localeCompare(timeB)
        })

    return (
        <div
            style={{
                width: '100%',
                backgroundColor: '#F2F2F2',
                minHeight: '100%',
                padding: 0,
                margin: 0,
                marginLeft: '-380px',
                paddingLeft: '380px',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Page Header */}
            <Box
                sx={{
                    width: '100vw',
                    ml: '-380px',
                    pl: '380px',
                    bgcolor: '#ffffff',
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    px: 3,
                    borderRadius: 0,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    mx: 0,
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography
                        variant="h3"
                        component="h3"
                        fontWeight="bold"
                        color="text.primary"
                        sx={{
                            fontSize: '2.3rem',
                            fontFamily:
                                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        Appointments
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 0 }}>
                        Manage patient appointments and schedules
                    </Typography>
                </Box>
            </Box>

            {/* Main Content Area */}
            <Box sx={{ px: 3, py: 3, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {/* Filter Buttons Bar */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 3,
                        flexWrap: 'wrap',
                        gap: 1,
                    }}
                >
                    {/* Left Side - Today, Date, View Mode */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                            variant="outlined"
                            onClick={handleToday}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                borderColor: '#e0e0e0',
                                color: 'text.primary',
                                bgcolor: '#f5f5f5',
                                '&:hover': {
                                    bgcolor: '#e0e0e0',
                                    borderColor: '#bdbdbd',
                                },
                            }}
                        >
                            Today
                        </Button>

                        <Button
                            variant="outlined"
                            onClick={handleDatePickerClick}
                            endIcon={<KeyboardArrowDownIcon />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                borderColor: '#e0e0e0',
                                color: 'text.primary',
                                bgcolor: '#f5f5f5',
                                '&:hover': {
                                    bgcolor: '#e0e0e0',
                                    borderColor: '#bdbdbd',
                                },
                            }}
                        >
                            {formatDateDisplay()}
                        </Button>

                        <Menu anchorEl={datePickerAnchor} open={Boolean(datePickerAnchor)} onClose={handleDatePickerClose}>
                            <MenuItem
                                onClick={() => {
                                    handleToday()
                                    handleDatePickerClose()
                                }}
                            >
                                Today
                            </MenuItem>

                            <MenuItem
                                onClick={() => {
                                    const tomorrow = new Date()
                                    tomorrow.setDate(tomorrow.getDate() + 1)
                                    setCurrentMonth(tomorrow)
                                    setSelectedDate(tomorrow)
                                    setRightPanelMode('selected') // ✅ switch right panel to selected date
                                    handleDatePickerClose()
                                }}
                            >
                                Tomorrow
                            </MenuItem>

                            <MenuItem
                                onClick={() => {
                                    const nextWeek = new Date()
                                    nextWeek.setDate(nextWeek.getDate() + 7)
                                    setCurrentMonth(nextWeek)
                                    setSelectedDate(nextWeek)
                                    setRightPanelMode('selected') // ✅ switch right panel to selected date
                                    handleDatePickerClose()
                                }}
                            >
                                Next Week
                            </MenuItem>
                        </Menu>

                        <Button
                            variant="outlined"
                            onClick={handleViewModeClick}
                            endIcon={<KeyboardArrowDownIcon />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                borderColor: '#e0e0e0',
                                color: 'text.primary',
                                bgcolor: '#f5f5f5',
                                '&:hover': {
                                    bgcolor: '#e0e0e0',
                                    borderColor: '#bdbdbd',
                                },
                            }}
                        >
                            {formatViewMode(viewMode)}
                        </Button>

                        <Menu anchorEl={viewModeAnchor} open={Boolean(viewModeAnchor)} onClose={() => handleViewModeClose()}>
                            <MenuItem onClick={() => handleViewModeClose('day')}>Day</MenuItem>
                            <MenuItem onClick={() => handleViewModeClose('week')}>Week</MenuItem>
                            <MenuItem onClick={() => handleViewModeClose('month')}>Month</MenuItem>
                            <MenuItem onClick={() => handleViewModeClose('year')}>Year</MenuItem>
                        </Menu>
                    </Box>

                    {/* Right Side - Navigation and Add Event */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                            onClick={handlePrevious}
                            sx={{
                                borderRadius: 2,
                                border: '1px solid #e0e0e0',
                                bgcolor: '#f5f5f5',
                                '&:hover': {
                                    bgcolor: '#e0e0e0',
                                },
                            }}
                        >
                            <ChevronLeftIcon />
                        </IconButton>

                        <IconButton
                            onClick={handleNext}
                            sx={{
                                borderRadius: 2,
                                border: '1px solid #e0e0e0',
                                bgcolor: '#f5f5f5',
                                '&:hover': {
                                    bgcolor: '#e0e0e0',
                                },
                            }}
                        >
                            <ChevronRightIcon />
                        </IconButton>

                    </Box>
                </Box>

                {/* Action Bar */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <TextField
                        placeholder="Search appointments..."
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{
                            width: { xs: '100%', sm: '400px' },
                            bgcolor: '#ffffff',
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddEvent}
                        sx={{
                            bgcolor: 'primary.main',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                            },
                        }}
                    >
                        New Appointment
                    </Button>
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

                {/* Calendar and Appointments Grid */}
                <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
                    {/* Left Column - Calendar */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {/* Calendar Header */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 3,
                                }}
                            >
                                <Typography variant="h6" fontWeight="600">
                                    {monthName}
                                </Typography>
                                <Box>
                                    <IconButton size="small" onClick={goToPreviousMonth}>
                                        <ChevronLeftIcon />
                                    </IconButton>
                                    <IconButton size="small" onClick={handleToday} sx={{ mx: 1 }}>
                                        <CalendarIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={goToNextMonth}>
                                        <ChevronRightIcon />
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* Calendar Grid */}
                            <Box sx={{ flex: 1 }}>
                                {/* Week Days Header */}
                                <Grid container spacing={0.5} sx={{ mb: 1 }}>
                                    {weekDays.map((day) => (
                                        <Grid size={12 / 7} key={day}>
                                            <Box
                                                sx={{
                                                    textAlign: 'center',
                                                    py: 1,
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem',
                                                    color: 'text.secondary',
                                                }}
                                            >
                                                {day}
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Calendar Days */}
                                <Grid container spacing={0.5}>
                                    {calendarDays.map((date, index) => (
                                        <Grid size={12 / 7} key={index}>
                                            {date ? (
                                                <Box
                                                    onClick={() => {
                                                        setSelectedDate(date)
                                                        setRightPanelMode('selected') // ✅ switch right panel to selected date
                                                    }}
                                                    sx={{
                                                        aspectRatio: '1',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        borderRadius: 1,
                                                        bgcolor: isSelected(date)
                                                            ? 'primary.main'
                                                            : isToday(date)
                                                                ? 'primary.light'
                                                                : 'transparent',
                                                        color: isSelected(date)
                                                            ? 'white'
                                                            : isToday(date)
                                                                ? 'primary.dark'
                                                                : 'text.primary',
                                                        '&:hover': {
                                                            bgcolor: isSelected(date)
                                                                ? 'primary.dark'
                                                                : 'rgba(0, 0, 0, 0.05)',
                                                        },
                                                        position: 'relative',
                                                    }}
                                                >
                                                    <Typography variant="body2" fontWeight={isSelected(date) || isToday(date) ? 600 : 400}>
                                                        {date.getDate()}
                                                    </Typography>

                                                    {hasAppointments(date) && (
                                                        <Box
                                                            sx={{
                                                                width: 6,
                                                                height: 6,
                                                                borderRadius: '50%',
                                                                bgcolor: isSelected(date) ? 'white' : 'primary.main',
                                                                mt: 0.5,
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            ) : (
                                                <Box sx={{ aspectRatio: '1' }} />
                                            )}
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Right Column - Appointments (Today by default; Selected date after click) */}
                    <Grid size={{ xs: 12, md: 6 }}>
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
                            {/* Appointments Header */}
                            <Box sx={{ mb: 2 }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} mb={1}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <CalendarIcon color="primary" />
                                        <Typography variant="h6" fontWeight="600">
                                            {rightPanelMode === 'today'
                                                ? "Today's Appointments"
                                                : `Appointments on ${formatDate(rightPanelDate)}`}
                                        </Typography>
                                    </Box>

                                    {/* ✅ Back to Today */}
                                    {rightPanelMode === 'selected' && (
                                        <Button size="small" variant="text" onClick={handleToday} sx={{ textTransform: 'none' }}>
                                            Back to Today
                                        </Button>
                                    )}
                                </Box>

                                <Typography variant="body2" color="text.secondary">
                                    {rightPanelAppointments.length} appointment{rightPanelAppointments.length !== 1 ? 's' : ''}
                                </Typography>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            {/* Appointments List */}
                            <Box sx={{ flex: 1, overflow: 'auto' }}>
                                {loading ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            height: '200px',
                                        }}
                                    >
                                        <CircularProgress />
                                    </Box>
                                ) : rightPanelAppointments.length === 0 ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            height: '200px',
                                            gap: 2,
                                        }}
                                    >
                                        <EventAvailableIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {rightPanelMode === 'today'
                                                ? 'No appointments scheduled for today'
                                                : 'No appointments scheduled for this date'}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box>
                                        {rightPanelAppointments.map((appointment, index) => (
                                            <Card
                                                key={appointment._id || appointment.id || index}
                                                sx={{
                                                    mb: 2,
                                                    border: '1px solid #e0e0e0',
                                                    borderRadius: 2,
                                                }}
                                            >
                                                <CardContent>
                                                    {/* Date/Time Header */}
                                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                        <Box
                                                            sx={{
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius: 1,
                                                                bgcolor: '#456086',
                                                                color: 'white',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontWeight: 'bold',
                                                            }}
                                                        >
                                                            {new Date(appointment.appointmentDate).getDate()}
                                                        </Box>
                                                        <Box flex={1}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Upcoming Event
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {appointment.patientName || 'Patient'} -{' '}
                                                                {appointment.appointmentType || 'Appointment'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Divider sx={{ my: 1.5 }} />

                                                    {/* Time Range */}
                                                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                                        <Box textAlign="center">
                                                            <Typography variant="h6" fontWeight="bold">
                                                                {formatTime(appointment.appointmentDate)}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {new Date(appointment.appointmentDate).getHours() >= 12 ? 'PM' : 'AM'}
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                ↔
                                                            </Typography>
                                                        </Box>

                                                        <Box textAlign="center">
                                                            <Typography variant="h6" fontWeight="bold">
                                                                {appointment.duration
                                                                    ? (() => {
                                                                        const start = new Date(appointment.appointmentDate)
                                                                        const end = new Date(start.getTime() + appointment.duration * 60000)
                                                                        return formatTime(end.toISOString())
                                                                    })()
                                                                    : formatTime(appointment.appointmentDate)}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {appointment.duration
                                                                    ? (() => {
                                                                        const start = new Date(appointment.appointmentDate)
                                                                        const end = new Date(start.getTime() + appointment.duration * 60000)
                                                                        return end.getHours() >= 12 ? 'PM' : 'AM'
                                                                    })()
                                                                    : new Date(appointment.appointmentDate).getHours() >= 12
                                                                        ? 'PM'
                                                                        : 'AM'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    {/* Status */}
                                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                        <Chip
                                                            label={appointment.status || 'Pending'}
                                                            color={getStatusColor(appointment.status) as any}
                                                            size="small"
                                                        />
                                                    </Box>

                                                    {/* Notes */}
                                                    {appointment.notes && (
                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                                                            {appointment.notes}
                                                        </Typography>
                                                    )}

                                                    {/* Meet Link Button */}
                                                    {appointment.meetLink && (
                                                        <Button
                                                            fullWidth
                                                            variant="outlined"
                                                            startIcon={<VideoCallIcon />}
                                                            href={appointment.meetLink}
                                                            target="_blank"
                                                            sx={{
                                                                mt: 1,
                                                                borderColor: '#e0e0e0',
                                                                color: 'text.secondary',
                                                                '&:hover': {
                                                                    borderColor: '#456086',
                                                                    bgcolor: '#f5f5f5',
                                                                },
                                                            }}
                                                        >
                                                            Go to meet link
                                                        </Button>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </div>
    )
}
