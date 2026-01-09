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
    const [viewMode, setViewMode] = useState<ViewMode>('day')
    const [viewModeAnchor, setViewModeAnchor] = useState<null | HTMLElement>(null)
    const [datePickerAnchor, setDatePickerAnchor] = useState<null | HTMLElement>(null)
    const [practitionerFilter, setPractitionerFilter] = useState<string>('all')
    const [practitionerAnchor, setPractitionerAnchor] = useState<null | HTMLElement>(null)

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
     * Get appointments for a specific hour (includes appointments that start in this hour or overlap with this hour)
     */
    const getAppointmentsForHour = (date: Date, hour: number) => {
        const appointmentsForDate = getAppointmentsForDate(date)
        return appointmentsForDate.filter((appointment) => {
            if (!appointment.appointmentDate) return false
            const appointmentDate = new Date(appointment.appointmentDate)
            const appointmentHour = appointmentDate.getHours()
            const duration = appointment.duration || 60 // Default 60 minutes
            const endTime = new Date(appointmentDate.getTime() + duration * 60000)
            const endHour = endTime.getHours()

            // Include if appointment starts in this hour or overlaps with this hour
            return appointmentHour === hour || (appointmentHour < hour && endHour >= hour)
        })
    }

    /**
     * Generate time slots for the day (8:00 AM to 8:00 PM) in 30-minute intervals
     */
    const generateTimeSlots = () => {
        const slots: { hour: number; minute: number }[] = []
        for (let hour = 8; hour <= 20; hour++) {
            slots.push({ hour, minute: 0 })
            if (hour < 20) {
                slots.push({ hour, minute: 30 })
            }
        }
        return slots
    }

    /**
     * Get upcoming appointments (within next 30 minutes)
     */
    const getUpcomingAppointments = () => {
        const now = new Date()
        const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000)
        
        return appointments.filter((appointment) => {
            if (!appointment.appointmentDate) return false
            const appointmentDate = new Date(appointment.appointmentDate)
            return appointmentDate >= now && appointmentDate <= thirtyMinutesLater
        }).sort((a, b) => {
            const timeA = new Date(a.appointmentDate).getTime()
            const timeB = new Date(b.appointmentDate).getTime()
            return timeA - timeB
        })
    }

    /**
     * Format hour for display (24-hour format with minutes)
     */
    const formatHour = (hour: number, minute: number = 0) => {
        if (typeof hour !== 'number' || typeof minute !== 'number') {
            return '00:00'
        }
        const h = hour.toString().padStart(2, '0')
        const m = minute.toString().padStart(2, '0')
        return `${h}:${m}`
    }

    /**
     * Get week dates starting from Monday
     */
    const getWeekDates = (date: Date) => {
        const weekDates: Date[] = []
        const currentDate = new Date(date)
        const day = currentDate.getDay()
        const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
        const monday = new Date(currentDate)
        monday.setDate(diff)

        for (let i = 0; i < 7; i++) {
            const weekDate = new Date(monday)
            weekDate.setDate(monday.getDate() + i)
            weekDates.push(weekDate)
        }
        return weekDates
    }

    /**
     * Get appointments for a specific date and hour range
     */
    const getAppointmentsForDateAndHour = (date: Date, hour: number) => {
        const appointmentsForDate = getAppointmentsForDate(date)
        return appointmentsForDate.filter((appointment) => {
            if (!appointment.appointmentDate) return false
            const appointmentDate = new Date(appointment.appointmentDate)
            const appointmentHour = appointmentDate.getHours()
            const duration = appointment.duration || 60 // Default 60 minutes
            const endTime = new Date(appointmentDate.getTime() + duration * 60000)
            const endHour = endTime.getHours()

            // Include if appointment starts in this hour or overlaps with this hour
            return appointmentHour === hour || (appointmentHour < hour && endHour >= hour)
        })
    }

    /**
     * Calculate appointment position and height in pixels
     */
    const getAppointmentPosition = (appointment: any, hourHeight: number = 60) => {
        const appointmentDate = new Date(appointment.appointmentDate)
        const startHour = appointmentDate.getHours()
        const startMinute = appointmentDate.getMinutes()
        const duration = appointment.duration || 60 // Default 60 minutes

        // Calculate top position (minutes into the hour)
        const top = (startMinute / 60) * hourHeight

        // Calculate height based on duration
        const height = (duration / 60) * hourHeight

        return { top, height }
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
        const newDate = new Date(selectedDate)
        switch (viewMode) {
            case 'day':
                newDate.setDate(newDate.getDate() - 1)
                setSelectedDate(newDate)
                setRightPanelMode('selected')
                break
            case 'week':
                newDate.setDate(newDate.getDate() - 7)
                setSelectedDate(newDate)
                setRightPanelMode('selected')
                break
            case 'month':
                const prevMonth = new Date(currentMonth)
                prevMonth.setMonth(prevMonth.getMonth() - 1)
                setCurrentMonth(prevMonth)
                break
            case 'year':
                const prevYear = new Date(currentMonth)
                prevYear.setFullYear(prevYear.getFullYear() - 1)
                setCurrentMonth(prevYear)
                break
        }
    }

    /**
     * Navigate to next period
     */
    const handleNext = () => {
        const newDate = new Date(selectedDate)
        switch (viewMode) {
            case 'day':
                newDate.setDate(newDate.getDate() + 1)
                setSelectedDate(newDate)
                setRightPanelMode('selected')
                break
            case 'week':
                newDate.setDate(newDate.getDate() + 7)
                setSelectedDate(newDate)
                setRightPanelMode('selected')
                break
            case 'month':
                const nextMonth = new Date(currentMonth)
                nextMonth.setMonth(nextMonth.getMonth() + 1)
                setCurrentMonth(nextMonth)
                break
            case 'year':
                const nextYear = new Date(currentMonth)
                nextYear.setFullYear(nextYear.getFullYear() + 1)
                setCurrentMonth(nextYear)
                break
        }
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
                {/* Upcoming Appointments Alert */}
                {getUpcomingAppointments().length > 0 && (
                    <Box
                        sx={{
                            mb: 2,
                            p: 2,
                            bgcolor: 'warning.light',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'warning.main',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <EventAvailableIcon sx={{ color: 'warning.dark' }} />
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600} color="warning.dark">
                                Upcoming Appointments ({getUpcomingAppointments().length})
                            </Typography>
                            <Typography variant="caption" color="warning.dark">
                                {getUpcomingAppointments()
                                    .map((apt) => `${apt.patientName || 'Patient'} at ${formatTime(apt.appointmentDate)}`)
                                    .join(', ')}
                            </Typography>
                        </Box>
                    </Box>
                )}

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
                    {/* Left Side - Today, Date, View Mode, Practitioner Filter */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                            variant="outlined"
                            onClick={handleToday}
                            startIcon={<CalendarIcon />}
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
                            {formatDate(rightPanelDate)}
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
                                    setRightPanelMode('selected')
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
                                    setRightPanelMode('selected')
                                    handleDatePickerClose()
                                }}
                            >
                                Next Week
                            </MenuItem>
                        </Menu>

                        <Button
                            variant="outlined"
                            onClick={(e) => setPractitionerAnchor(e.currentTarget)}
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
                            {practitionerFilter === 'all' ? 'All Practitioners' : practitionerFilter}
                        </Button>

                        <Menu
                            anchorEl={practitionerAnchor}
                            open={Boolean(practitionerAnchor)}
                            onClose={() => setPractitionerAnchor(null)}
                        >
                            <MenuItem
                                onClick={() => {
                                    setPractitionerFilter('all')
                                    setPractitionerAnchor(null)
                                }}
                            >
                                All Practitioners
                            </MenuItem>
                            {/* Add more practitioners here when available */}
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
                    {/* Left Column - Calendar (only show in month view) */}
                    {viewMode === 'month' && (
                        <Grid size={{ xs: 12, md: 4 }}>
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
                    )}

                    {/* Right Column - Calendar View (Day/Week/Month) */}
                    <Grid size={{ xs: 12, md: viewMode === 'month' ? 8 : 12 }}>
                        <Paper
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: 0,
                            }}
                        >
                            {/* View Header */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="h6" fontWeight="600">
                                    {viewMode === 'day'
                                        ? formatDate(rightPanelDate)
                                        : viewMode === 'week'
                                          ? `Week of ${formatDate(getWeekDates(rightPanelDate)[0])}`
                                          : viewMode === 'month'
                                            ? currentMonth.toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' })
                                            : viewMode === 'year'
                                              ? currentMonth.getFullYear().toString()
                                              : formatDate(rightPanelDate)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {viewMode === 'day'
                                        ? `${rightPanelAppointments.length} appointment${rightPanelAppointments.length !== 1 ? 's' : ''}`
                                        : viewMode === 'week'
                                          ? `${getWeekDates(rightPanelDate).reduce((sum, date) => sum + getAppointmentsForDate(date).length, 0)} appointments this week`
                                          : viewMode === 'month'
                                            ? `${appointments.filter((apt) => {
                                                  if (!apt.appointmentDate) return false
                                                  const aptDate = new Date(apt.appointmentDate)
                                                  return (
                                                      aptDate.getMonth() === currentMonth.getMonth() &&
                                                      aptDate.getFullYear() === currentMonth.getFullYear()
                                                  )
                                              }).length} appointments this month`
                                            : viewMode === 'year'
                                              ? `${appointments.filter((apt) => {
                                                    if (!apt.appointmentDate) return false
                                                    const aptDate = new Date(apt.appointmentDate)
                                                    return aptDate.getFullYear() === currentMonth.getFullYear()
                                                }).length} appointments this year`
                                              : ''}
                                </Typography>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            {/* Day View Calendar Grid */}
                            {viewMode === 'day' && (
                            <Box sx={{ flex: 1, overflow: 'auto', position: 'relative' }}>
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
                                ) : (
                                    <Box sx={{ position: 'relative', display: 'flex' }}>
                                        {/* Time Column */}
                                        <Box
                                            sx={{
                                                width: '80px',
                                                flexShrink: 0,
                                                borderRight: '1px solid #e0e0e0',
                                            }}
                                        >
                                            {generateTimeSlots().map((slot, index) => {
                                                const now = new Date()
                                                const isCurrentTime =
                                                    rightPanelDate.getDate() === now.getDate() &&
                                                    rightPanelDate.getMonth() === now.getMonth() &&
                                                    rightPanelDate.getFullYear() === now.getFullYear() &&
                                                    slot.hour === now.getHours() &&
                                                    slot.minute <= now.getMinutes() &&
                                                    (index === generateTimeSlots().length - 1 ||
                                                        generateTimeSlots()[index + 1].hour > now.getHours() ||
                                                        (generateTimeSlots()[index + 1].hour === now.getHours() &&
                                                            generateTimeSlots()[index + 1].minute > now.getMinutes()))

                                                return (
                                                    <Box
                                                        key={`${slot.hour}-${slot.minute}`}
                                                        sx={{
                                                            height: '60px',
                                                            borderBottom: '1px solid #e0e0e0',
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            justifyContent: 'flex-end',
                                                            pr: 1,
                                                            pt: 0.5,
                                                            bgcolor: isCurrentTime ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: isCurrentTime ? 'primary.main' : 'text.secondary',
                                                                fontWeight: isCurrentTime ? 600 : 400,
                                                                fontSize: '0.75rem',
                                                            }}
                                                        >
                                                            {formatHour(slot.hour, slot.minute)}
                                                        </Typography>
                                                    </Box>
                                                )
                                            })}
                                        </Box>

                                        {/* Appointments Column */}
                                        <Box sx={{ flex: 1, position: 'relative' }}>
                                            {generateTimeSlots().map((slot, index) => {
                                                const now = new Date()
                                                const isCurrentTime =
                                                    rightPanelDate.getDate() === now.getDate() &&
                                                    rightPanelDate.getMonth() === now.getMonth() &&
                                                    rightPanelDate.getFullYear() === now.getFullYear() &&
                                                    slot.hour === now.getHours() &&
                                                    slot.minute <= now.getMinutes() &&
                                                    (index === generateTimeSlots().length - 1 ||
                                                        generateTimeSlots()[index + 1].hour > now.getHours() ||
                                                        (generateTimeSlots()[index + 1].hour === now.getHours() &&
                                                            generateTimeSlots()[index + 1].minute > now.getMinutes()))

                                                // Get appointments that overlap with this time slot
                                                const slotAppointments = rightPanelAppointments.filter((appointment) => {
                                                    if (!appointment.appointmentDate) return false
                                                    const appointmentDate = new Date(appointment.appointmentDate)
                                                    const appointmentHour = appointmentDate.getHours()
                                                    const appointmentMinute = appointmentDate.getMinutes()
                                                    const duration = appointment.duration || 60
                                                    const endTime = new Date(appointmentDate.getTime() + duration * 60000)
                                                    const endHour = endTime.getHours()
                                                    const endMinute = endTime.getMinutes()

                                                    const slotStart = slot.hour * 60 + slot.minute
                                                    const slotEnd = slotStart + 30
                                                    const appointmentStart = appointmentHour * 60 + appointmentMinute
                                                    const appointmentEnd = endHour * 60 + endMinute

                                                    return appointmentStart < slotEnd && appointmentEnd > slotStart
                                                })

                                                return (
                                                    <Box
                                                        key={`${slot.hour}-${slot.minute}`}
                                                        sx={{
                                                            height: '60px',
                                                            borderBottom: '1px solid #e0e0e0',
                                                            position: 'relative',
                                                            bgcolor: isCurrentTime ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
                                                        }}
                                                    >
                                                        {slotAppointments.map((appointment) => {
                                                            const appointmentDate = new Date(appointment.appointmentDate)
                                                            const appointmentHour = appointmentDate.getHours()
                                                            const appointmentMinute = appointmentDate.getMinutes()
                                                            const duration = appointment.duration || 60
                                                            const endTime = new Date(
                                                                appointmentDate.getTime() + duration * 60000
                                                            )

                                                            // Calculate position
                                                            const slotStartMinutes = slot.hour * 60 + slot.minute
                                                            const appointmentStartMinutes = appointmentHour * 60 + appointmentMinute
                                                            const appointmentEndMinutes =
                                                                endTime.getHours() * 60 + endTime.getMinutes()

                                                            // Only render if appointment starts in this slot or overlaps
                                                            if (
                                                                appointmentStartMinutes >= slotStartMinutes &&
                                                                appointmentStartMinutes < slotStartMinutes + 30
                                                            ) {
                                                                const top = ((appointmentStartMinutes - slotStartMinutes) / 30) * 60
                                                                const height = ((appointmentEndMinutes - appointmentStartMinutes) / 30) * 60

                                                                const statusColor = getStatusColor(appointment.status)
                                                                const getCardColor = () => {
                                                                    switch (statusColor) {
                                                                        case 'success':
                                                                            return { bg: '#e8f5e9', border: '#4caf50', text: '#1b5e20' }
                                                                        case 'warning':
                                                                            return { bg: '#fff3e0', border: '#ff9800', text: '#e65100' }
                                                                        case 'error':
                                                                            return { bg: '#ffebee', border: '#f44336', text: '#b71c1c' }
                                                                        case 'info':
                                                                            return { bg: '#e3f2fd', border: '#2196f3', text: '#0d47a1' }
                                                                        default:
                                                                            return { bg: '#f3e5f5', border: '#9c27b0', text: '#4a148c' }
                                                                    }
                                                                }

                                                                const colors = getCardColor()

                                                                return (
                                                                    <Box
                                                                        key={appointment._id || appointment.id}
                                                                        onClick={() => {
                                                                            // Handle appointment click
                                                                        }}
                                                                        sx={{
                                                                            position: 'absolute',
                                                                            top: `${top}px`,
                                                                            left: '4px',
                                                                            right: '4px',
                                                                            height: `${Math.max(height, 40)}px`,
                                                                            minHeight: '40px',
                                                                            bgcolor: colors.bg,
                                                                            borderLeft: `4px solid ${colors.border}`,
                                                                            borderRadius: '4px',
                                                                            p: 1,
                                                                            cursor: 'pointer',
                                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                                            transition: 'all 0.2s',
                                                                            '&:hover': {
                                                                                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                                                                transform: 'translateX(2px)',
                                                                            },
                                                                            zIndex: 5,
                                                                            overflow: 'hidden',
                                                                        }}
                                                                    >
                                                                        <Typography
                                                                            variant="caption"
                                                                            sx={{
                                                                                display: 'block',
                                                                                fontWeight: 700,
                                                                                color: colors.text,
                                                                                fontSize: '0.7rem',
                                                                                lineHeight: 1.2,
                                                                                mb: 0.25,
                                                                            }}
                                                                        >
                                                                            {formatTime(appointment.appointmentDate)} -{' '}
                                                                            {formatTime(endTime.toISOString())}
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="body2"
                                                                            sx={{
                                                                                display: 'block',
                                                                                fontWeight: 600,
                                                                                color: colors.text,
                                                                                fontSize: '0.875rem',
                                                                                lineHeight: 1.2,
                                                                                overflow: 'hidden',
                                                                                textOverflow: 'ellipsis',
                                                                                whiteSpace: 'nowrap',
                                                                            }}
                                                                        >
                                                                            {appointment.patientName || 'Patient'}
                                                                        </Typography>
                                                                        <Box
                                                                            sx={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: 0.5,
                                                                                mt: 0.5,
                                                                            }}
                                                                        >
                                                                            {appointment.meetLink && (
                                                                                <VideoCallIcon
                                                                                    sx={{
                                                                                        fontSize: '14px',
                                                                                        color: colors.text,
                                                                                        opacity: 0.8,
                                                                                    }}
                                                                                />
                                                                            )}
                                                                            {appointment.notes && (
                                                                                <Typography
                                                                                    variant="caption"
                                                                                    sx={{
                                                                                        fontSize: '0.65rem',
                                                                                        color: colors.text,
                                                                                        opacity: 0.7,
                                                                                        overflow: 'hidden',
                                                                                        textOverflow: 'ellipsis',
                                                                                        whiteSpace: 'nowrap',
                                                                                    }}
                                                                                >
                                                                                    {appointment.notes}
                                                                                </Typography>
                                                                            )}
                                                                        </Box>
                                                                    </Box>
                                                                )
                                                            }
                                                            return null
                                                        })}
                                                    </Box>
                                                )
                                            })}
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                            )}

                            {/* Week View Calendar Grid */}
                            {viewMode === 'week' && (
                                <Box sx={{ flex: 1, overflow: 'auto', position: 'relative' }}>
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
                                    ) : (
                                        <Box sx={{ position: 'relative' }}>
                                            {/* Week Days Header */}
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    position: 'sticky',
                                                    top: 0,
                                                    bgcolor: 'background.paper',
                                                    zIndex: 10,
                                                    borderBottom: '2px solid #e0e0e0',
                                                    mb: 0,
                                                }}
                                            >
                                                {/* Time column header */}
                                                <Box
                                                    sx={{
                                                        width: '80px',
                                                        flexShrink: 0,
                                                        borderRight: '1px solid #e0e0e0',
                                                        py: 1,
                                                    }}
                                                />
                                                {/* Day columns */}
                                                {getWeekDates(rightPanelDate).map((date, index) => {
                                                    const isTodayDate = isToday(date)
                                                    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                                                    return (
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                flex: 1,
                                                                textAlign: 'center',
                                                                py: 1,
                                                                borderRight: '1px solid #e0e0e0',
                                                                bgcolor: isTodayDate ? 'primary.light' : 'transparent',
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    display: 'block',
                                                                    fontWeight: isTodayDate ? 700 : 500,
                                                                    color: isTodayDate ? 'primary.main' : 'text.secondary',
                                                                    fontSize: '0.75rem',
                                                                }}
                                                            >
                                                                {dayNames[index]}
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontWeight: isTodayDate ? 700 : 600,
                                                                    color: isTodayDate ? 'primary.main' : 'text.primary',
                                                                    fontSize: '1rem',
                                                                }}
                                                            >
                                                                {date.getDate()}
                                                            </Typography>
                                                        </Box>
                                                    )
                                                })}
                                            </Box>

                                            {/* Time Grid */}
                                            <Box sx={{ position: 'relative' }}>
                                                {generateTimeSlots().map((slot) => {
                                                    const hourHeight = 60
                                                    return (
                                                        <Box
                                                            key={`${slot.hour}-${slot.minute}`}
                                                            sx={{
                                                                display: 'flex',
                                                                borderBottom: '1px solid #e0e0e0',
                                                                minHeight: `${hourHeight}px`,
                                                                position: 'relative',
                                                            }}
                                                        >
                                                            {/* Time Label */}
                                                            <Box
                                                                sx={{
                                                                    width: '80px',
                                                                    flexShrink: 0,
                                                                    borderRight: '1px solid #e0e0e0',
                                                                    display: 'flex',
                                                                    alignItems: 'flex-start',
                                                                    justifyContent: 'flex-end',
                                                                    pr: 1,
                                                                    pt: 0.5,
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: 'text.secondary',
                                                                        fontWeight: 500,
                                                                        fontSize: '0.75rem',
                                                                    }}
                                                                >
                                                                    {formatHour(slot.hour, slot.minute)}
                                                                </Typography>
                                                            </Box>

                                                            {/* Day Columns */}
                                                            {getWeekDates(rightPanelDate).map((date, dayIndex) => {
                                                                const allDayAppointments = getAppointmentsForDate(date)
                                                                const visibleAppointments = allDayAppointments.filter(
                                                                    (appointment) => {
                                                                        if (!appointment.appointmentDate) return false
                                                                        const appointmentDate = new Date(appointment.appointmentDate)
                                                                        const appointmentHour = appointmentDate.getHours()
                                                                        const duration = appointment.duration || 60
                                                                        const endTime = new Date(
                                                                            appointmentDate.getTime() + duration * 60000
                                                                        )
                                                                        const endHour = endTime.getHours()
                                                                        const slotStart = slot.hour * 60 + slot.minute
                                                                        const slotEnd = slotStart + 30
                                                                        const appointmentStart = appointmentHour * 60 + appointmentDate.getMinutes()
                                                                        const appointmentEnd = endHour * 60 + endTime.getMinutes()

                                                                        return appointmentStart < slotEnd && appointmentEnd > slotStart
                                                                    }
                                                                )

                                                                return (
                                                                    <Box
                                                                        key={dayIndex}
                                                                        sx={{
                                                                            flex: 1,
                                                                            borderRight: '1px solid #e0e0e0',
                                                                            position: 'relative',
                                                                            minHeight: `${hourHeight}px`,
                                                                        }}
                                                                    >
                                                                        {visibleAppointments.map((appointment) => {
                                                                            const appointmentDate = new Date(
                                                                                appointment.appointmentDate
                                                                            )
                                                                            const appointmentHour = appointmentDate.getHours()
                                                                            const appointmentMinute = appointmentDate.getMinutes()
                                                                            const duration = appointment.duration || 60

                                                                            let top = 0
                                                                            let height = hourHeight

                                                                            if (appointmentHour === slot.hour) {
                                                                                top = (appointmentMinute / 60) * hourHeight
                                                                                const remainingMinutes = duration - (60 - appointmentMinute)
                                                                                if (remainingMinutes > 0) {
                                                                                    height = hourHeight - top
                                                                                } else {
                                                                                    height = (duration / 60) * hourHeight
                                                                                }
                                                                            } else if (appointmentHour < slot.hour) {
                                                                                const endTime = new Date(
                                                                                    appointmentDate.getTime() + duration * 60000
                                                                                )
                                                                                const endHour = endTime.getHours()
                                                                                const endMinute = endTime.getMinutes()

                                                                                if (endHour === slot.hour) {
                                                                                    top = 0
                                                                                    height = (endMinute / 60) * hourHeight
                                                                                } else if (endHour > slot.hour) {
                                                                                    top = 0
                                                                                    height = hourHeight
                                                                                } else {
                                                                                    return null
                                                                                }
                                                                            } else {
                                                                                return null
                                                                            }

                                                                            const statusColor = getStatusColor(appointment.status)
                                                                            const getCardColor = () => {
                                                                                switch (statusColor) {
                                                                                    case 'success':
                                                                                        return '#4caf50'
                                                                                    case 'warning':
                                                                                        return '#ff9800'
                                                                                    case 'error':
                                                                                        return '#f44336'
                                                                                    case 'info':
                                                                                        return '#2196f3'
                                                                                    default:
                                                                                        return '#9c27b0'
                                                                                }
                                                                            }

                                                                            return (
                                                                                <Box
                                                                                    key={`${appointment._id || appointment.id}-${slot.hour}-${slot.minute}`}
                                                                                    onClick={() => {
                                                                                        setSelectedDate(date)
                                                                                        setRightPanelMode('selected')
                                                                                        setViewMode('day')
                                                                                    }}
                                                                                    sx={{
                                                                                        position: 'absolute',
                                                                                        top: `${top}px`,
                                                                                        left: '4px',
                                                                                        right: '4px',
                                                                                        height: `${Math.max(height, 20)}px`,
                                                                                        minHeight: '20px',
                                                                                        bgcolor: getCardColor(),
                                                                                        borderRadius: '4px',
                                                                                        p: 0.75,
                                                                                        cursor: 'pointer',
                                                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                                                        transition: 'all 0.2s',
                                                                                        '&:hover': {
                                                                                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                                                                            transform: 'translateY(-1px)',
                                                                                        },
                                                                                        zIndex: 5,
                                                                                        overflow: 'hidden',
                                                                                    }}
                                                                                >
                                                                                    {appointmentHour === slot.hour && (
                                                                                        <>
                                                                                            <Typography
                                                                                                variant="caption"
                                                                                                sx={{
                                                                                                    display: 'block',
                                                                                                    fontWeight: 700,
                                                                                                    color: 'white',
                                                                                                    fontSize: '0.7rem',
                                                                                                    lineHeight: 1.2,
                                                                                                    mb: 0.25,
                                                                                                }}
                                                                                            >
                                                                                                {formatTime(appointment.appointmentDate)}
                                                                                            </Typography>
                                                                                            <Typography
                                                                                                variant="caption"
                                                                                                sx={{
                                                                                                    display: 'block',
                                                                                                    fontWeight: 600,
                                                                                                    color: 'white',
                                                                                                    fontSize: '0.75rem',
                                                                                                    lineHeight: 1.2,
                                                                                                    overflow: 'hidden',
                                                                                                    textOverflow: 'ellipsis',
                                                                                                    whiteSpace: 'nowrap',
                                                                                                }}
                                                                                            >
                                                                                                {appointment.patientName || 'Patient'}
                                                                                            </Typography>
                                                                                        </>
                                                                                    )}
                                                                                    {appointment.meetLink && (
                                                                                        <VideoCallIcon
                                                                                            sx={{
                                                                                                position: 'absolute',
                                                                                                top: '4px',
                                                                                                right: '4px',
                                                                                                fontSize: '14px',
                                                                                                color: 'white',
                                                                                                opacity: 0.9,
                                                                                            }}
                                                                                        />
                                                                                    )}
                                                                                </Box>
                                                                            )
                                                                        })}
                                                                    </Box>
                                                                )
                                                            })}
                                                        </Box>
                                                    )
                                                })}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {/* Month View - Show day view when month is selected */}
                            {viewMode === 'month' && (
                                <Box sx={{ flex: 1, overflow: 'auto', position: 'relative' }}>
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
                                    ) : (
                                        <Box sx={{ position: 'relative', display: 'flex' }}>
                                            {/* Time Column */}
                                            <Box
                                                sx={{
                                                    width: '80px',
                                                    flexShrink: 0,
                                                    borderRight: '1px solid #e0e0e0',
                                                }}
                                            >
                                                {generateTimeSlots().map((slot, index) => {
                                                    const now = new Date()
                                                    const isCurrentTime =
                                                        rightPanelDate.getDate() === now.getDate() &&
                                                        rightPanelDate.getMonth() === now.getMonth() &&
                                                        rightPanelDate.getFullYear() === now.getFullYear() &&
                                                        slot.hour === now.getHours() &&
                                                        slot.minute <= now.getMinutes() &&
                                                        (index === generateTimeSlots().length - 1 ||
                                                            generateTimeSlots()[index + 1].hour > now.getHours() ||
                                                            (generateTimeSlots()[index + 1].hour === now.getHours() &&
                                                                generateTimeSlots()[index + 1].minute > now.getMinutes()))

                                                    return (
                                                        <Box
                                                            key={`${slot.hour}-${slot.minute}`}
                                                            sx={{
                                                                height: '60px',
                                                                borderBottom: '1px solid #e0e0e0',
                                                                display: 'flex',
                                                                alignItems: 'flex-start',
                                                                justifyContent: 'flex-end',
                                                                pr: 1,
                                                                pt: 0.5,
                                                                bgcolor: isCurrentTime ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: isCurrentTime ? 'primary.main' : 'text.secondary',
                                                                    fontWeight: isCurrentTime ? 600 : 400,
                                                                    fontSize: '0.75rem',
                                                                }}
                                                            >
                                                                {formatHour(slot.hour, slot.minute)}
                                                            </Typography>
                                                        </Box>
                                                    )
                                                })}
                                            </Box>

                                            {/* Appointments Column */}
                                            <Box sx={{ flex: 1, position: 'relative' }}>
                                                {generateTimeSlots().map((slot, index) => {
                                                    const now = new Date()
                                                    const isCurrentTime =
                                                        rightPanelDate.getDate() === now.getDate() &&
                                                        rightPanelDate.getMonth() === now.getMonth() &&
                                                        rightPanelDate.getFullYear() === now.getFullYear() &&
                                                        slot.hour === now.getHours() &&
                                                        slot.minute <= now.getMinutes() &&
                                                        (index === generateTimeSlots().length - 1 ||
                                                            generateTimeSlots()[index + 1].hour > now.getHours() ||
                                                            (generateTimeSlots()[index + 1].hour === now.getHours() &&
                                                                generateTimeSlots()[index + 1].minute > now.getMinutes()))

                                                    const slotAppointments = rightPanelAppointments.filter((appointment) => {
                                                        if (!appointment.appointmentDate) return false
                                                        const appointmentDate = new Date(appointment.appointmentDate)
                                                        const appointmentHour = appointmentDate.getHours()
                                                        const appointmentMinute = appointmentDate.getMinutes()
                                                        const duration = appointment.duration || 60
                                                        const endTime = new Date(
                                                            appointmentDate.getTime() + duration * 60000
                                                        )

                                                        const slotStart = slot.hour * 60 + slot.minute
                                                        const slotEnd = slotStart + 30
                                                        const appointmentStart = appointmentHour * 60 + appointmentMinute
                                                        const appointmentEnd = endTime.getHours() * 60 + endTime.getMinutes()

                                                        return appointmentStart < slotEnd && appointmentEnd > slotStart
                                                    })

                                                    return (
                                                        <Box
                                                            key={`${slot.hour}-${slot.minute}`}
                                                            sx={{
                                                                height: '60px',
                                                                borderBottom: '1px solid #e0e0e0',
                                                                position: 'relative',
                                                                bgcolor: isCurrentTime ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
                                                            }}
                                                        >
                                                            {slotAppointments.map((appointment) => {
                                                                const appointmentDate = new Date(appointment.appointmentDate)
                                                                const appointmentHour = appointmentDate.getHours()
                                                                const appointmentMinute = appointmentDate.getMinutes()
                                                                const duration = appointment.duration || 60
                                                                const endTime = new Date(
                                                                    appointmentDate.getTime() + duration * 60000
                                                                )

                                                                const slotStartMinutes = slot.hour * 60 + slot.minute
                                                                const appointmentStartMinutes = appointmentHour * 60 + appointmentMinute
                                                                const appointmentEndMinutes =
                                                                    endTime.getHours() * 60 + endTime.getMinutes()

                                                                if (
                                                                    appointmentStartMinutes >= slotStartMinutes &&
                                                                    appointmentStartMinutes < slotStartMinutes + 30
                                                                ) {
                                                                    const top = ((appointmentStartMinutes - slotStartMinutes) / 30) * 60
                                                                    const height = ((appointmentEndMinutes - appointmentStartMinutes) / 30) * 60

                                                                    const statusColor = getStatusColor(appointment.status)
                                                                    const getCardColor = () => {
                                                                        switch (statusColor) {
                                                                            case 'success':
                                                                                return { bg: '#e8f5e9', border: '#4caf50', text: '#1b5e20' }
                                                                            case 'warning':
                                                                                return { bg: '#fff3e0', border: '#ff9800', text: '#e65100' }
                                                                            case 'error':
                                                                                return { bg: '#ffebee', border: '#f44336', text: '#b71c1c' }
                                                                            case 'info':
                                                                                return { bg: '#e3f2fd', border: '#2196f3', text: '#0d47a1' }
                                                                            default:
                                                                                return { bg: '#f3e5f5', border: '#9c27b0', text: '#4a148c' }
                                                                        }
                                                                    }

                                                                    const colors = getCardColor()

                                                                    return (
                                                                        <Box
                                                                            key={appointment._id || appointment.id}
                                                                            onClick={() => {
                                                                                // Handle appointment click
                                                                            }}
                                                                            sx={{
                                                                                position: 'absolute',
                                                                                top: `${top}px`,
                                                                                left: '4px',
                                                                                right: '4px',
                                                                                height: `${Math.max(height, 40)}px`,
                                                                                minHeight: '40px',
                                                                                bgcolor: colors.bg,
                                                                                borderLeft: `4px solid ${colors.border}`,
                                                                                borderRadius: '4px',
                                                                                p: 1,
                                                                                cursor: 'pointer',
                                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                                                transition: 'all 0.2s',
                                                                                '&:hover': {
                                                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                                                                    transform: 'translateX(2px)',
                                                                                },
                                                                                zIndex: 5,
                                                                                overflow: 'hidden',
                                                                            }}
                                                                        >
                                                                            <Typography
                                                                                variant="caption"
                                                                                sx={{
                                                                                    display: 'block',
                                                                                    fontWeight: 700,
                                                                                    color: colors.text,
                                                                                    fontSize: '0.7rem',
                                                                                    lineHeight: 1.2,
                                                                                    mb: 0.25,
                                                                                }}
                                                                            >
                                                                                {formatTime(appointment.appointmentDate)} -{' '}
                                                                                {formatTime(endTime.toISOString())}
                                                                            </Typography>
                                                                            <Typography
                                                                                variant="body2"
                                                                                sx={{
                                                                                    display: 'block',
                                                                                    fontWeight: 600,
                                                                                    color: colors.text,
                                                                                    fontSize: '0.875rem',
                                                                                    lineHeight: 1.2,
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                    whiteSpace: 'nowrap',
                                                                                }}
                                                                            >
                                                                                {appointment.patientName || 'Patient'}
                                                                            </Typography>
                                                                            <Box
                                                                                sx={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: 0.5,
                                                                                    mt: 0.5,
                                                                                }}
                                                                            >
                                                                                {appointment.meetLink && (
                                                                                    <VideoCallIcon
                                                                                        sx={{
                                                                                            fontSize: '14px',
                                                                                            color: colors.text,
                                                                                            opacity: 0.8,
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                                {appointment.notes && (
                                                                                    <Typography
                                                                                        variant="caption"
                                                                                        sx={{
                                                                                            fontSize: '0.65rem',
                                                                                            color: colors.text,
                                                                                            opacity: 0.7,
                                                                                            overflow: 'hidden',
                                                                                            textOverflow: 'ellipsis',
                                                                                            whiteSpace: 'nowrap',
                                                                                        }}
                                                                                    >
                                                                                        {appointment.notes}
                                                                                    </Typography>
                                                                                )}
                                                                            </Box>
                                                                        </Box>
                                                                    )
                                                                }
                                                                return null
                                                            })}
                                                        </Box>
                                                    )
                                                })}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {/* Year View - Show all 12 months */}
                            {viewMode === 'year' && (
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
                                    ) : (
                                        <Grid container spacing={2}>
                                            {Array.from({ length: 12 }, (_, i) => {
                                                const monthDate = new Date(currentMonth.getFullYear(), i, 1)
                                                const monthName = monthDate.toLocaleDateString('en-NZ', { month: 'long' })
                                                const monthAppointments = appointments.filter((apt) => {
                                                    if (!apt.appointmentDate) return false
                                                    const aptDate = new Date(apt.appointmentDate)
                                                    return (
                                                        aptDate.getMonth() === i &&
                                                        aptDate.getFullYear() === currentMonth.getFullYear()
                                                    )
                                                })
                                                const isCurrentMonth =
                                                    new Date().getMonth() === i &&
                                                    new Date().getFullYear() === currentMonth.getFullYear()

                                                return (
                                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                                                        <Paper
                                                            onClick={() => {
                                                                setCurrentMonth(monthDate)
                                                                setSelectedDate(monthDate)
                                                                setViewMode('month')
                                                            }}
                                                            sx={{
                                                                p: 2,
                                                                borderRadius: 2,
                                                                border: isCurrentMonth ? '2px solid' : '1px solid',
                                                                borderColor: isCurrentMonth ? 'primary.main' : '#e0e0e0',
                                                                bgcolor: isCurrentMonth ? 'rgba(25, 118, 210, 0.05)' : 'background.paper',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s',
                                                                '&:hover': {
                                                                    boxShadow: 3,
                                                                    transform: 'translateY(-2px)',
                                                                    borderColor: 'primary.main',
                                                                },
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="h6"
                                                                sx={{
                                                                    fontWeight: isCurrentMonth ? 700 : 600,
                                                                    color: isCurrentMonth ? 'primary.main' : 'text.primary',
                                                                    mb: 1,
                                                                }}
                                                            >
                                                                {monthName}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                {monthAppointments.length} appointment{monthAppointments.length !== 1 ? 's' : ''}
                                                            </Typography>
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    flexWrap: 'wrap',
                                                                    gap: 0.5,
                                                                    mt: 1,
                                                                }}
                                                            >
                                                                {Array.from({ length: new Date(currentMonth.getFullYear(), i + 1, 0).getDate() }, (_, day) => {
                                                                    const dayDate = new Date(currentMonth.getFullYear(), i, day + 1)
                                                                    const dayAppointments = getAppointmentsForDate(dayDate)
                                                                    const hasAppts = dayAppointments.length > 0
                                                                    const isTodayDate = isToday(dayDate)

                                                                    return (
                                                                        <Box
                                                                            key={day}
                                                                            sx={{
                                                                                width: '24px',
                                                                                height: '24px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                borderRadius: '4px',
                                                                                bgcolor: isTodayDate
                                                                                    ? 'primary.main'
                                                                                    : hasAppts
                                                                                      ? 'primary.light'
                                                                                      : 'transparent',
                                                                                color: isTodayDate ? 'white' : hasAppts ? 'primary.dark' : 'text.secondary',
                                                                                fontSize: '0.7rem',
                                                                                fontWeight: isTodayDate ? 700 : hasAppts ? 600 : 400,
                                                                            }}
                                                                        >
                                                                            {day + 1}
                                                                        </Box>
                                                                    )
                                                                })}
                                                            </Box>
                                                        </Paper>
                                                    </Grid>
                                                )
                                            })}
                                        </Grid>
                                    )}
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </div>
    )
}
