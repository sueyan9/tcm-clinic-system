'use client'

import { useEffect, useState } from 'react'
import {
    Typography,
    Paper,
    Box,
    Button,
    TextField,
    CircularProgress,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Autocomplete,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material'
import {
    CalendarToday as CalendarIcon,
    AccessTime as AccessTimeIcon,
    Person as PersonIcon,
    Description as DescriptionIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface Patient {
    _id?: string
    id?: string
    firstName: string
    lastName: string
    email?: string
    phone?: string
}

interface TimeSlot {
    time: string
    available: boolean
}

/**
 * Book Appointment page - allows doctors and patients to create appointments
 */
export default function BookAppointment() {
    const router = useRouter()
    const [activeStep, setActiveStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [patients, setPatients] = useState<Patient[]>([])
    const [isNewPatient, setIsNewPatient] = useState(false)
    const [newPatientName, setNewPatientName] = useState('')

    // Form state
    const [formData, setFormData] = useState({
        patientId: '',
        patientName: '',
        appointmentDate: '',
        appointmentTime: '',
        appointmentType: '',
        duration: 60,
        notes: '',
    })

    const steps = ['Select Patient', 'Choose Date & Time', 'Appointment Details', 'Confirmation']

    useEffect(() => {
        fetchPatients()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /**
     * Fetch patients from the API
     */
    const fetchPatients = async () => {
        try {
            const response = await api.get('/api/patients')
            setPatients(response.data.patients || response.data || [])
        } catch (err: any) {
            console.error('Error fetching patients:', err)
        }
    }

    /**
     * Generate available time slots
     */
    const generateTimeSlots = (): TimeSlot[] => {
        const slots: TimeSlot[] = []
        const startHour = 9 // 9 AM
        const endHour = 17 // 5 PM

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                slots.push({
                    time: timeString,
                    available: true, // In a real app, this would check against existing appointments
                })
            }
        }

        return slots
    }

    /**
     * Handle form field change
     */
    const handleFormChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
        setError(null)
    }

    /**
     * Handle patient selection or new patient input
     */
    const handlePatientSelect = (value: Patient | string | null) => {
        if (!value) {
            setFormData((prev) => ({
                ...prev,
                patientId: '',
                patientName: '',
            }))
            setIsNewPatient(false)
            setNewPatientName('')
            setError(null)
            return
        }

        // If it's a string (new patient name)
        if (typeof value === 'string') {
            setIsNewPatient(true)
            setNewPatientName(value)
            setFormData((prev) => ({
                ...prev,
                patientId: '',
                patientName: value.trim(),
            }))
        } else {
            // If it's an existing patient
            setIsNewPatient(false)
            setNewPatientName('')
            setFormData((prev) => ({
                ...prev,
                patientId: value._id || value.id || '',
                patientName: `${value.firstName} ${value.lastName}`,
            }))
        }
        setError(null)
    }

    /**
     * Create new patient and proceed
     */
    const handleCreateNewPatient = async () => {
        if (!newPatientName.trim()) {
            setError('Please enter patient name')
            return
        }

        // Parse name into first and last name
        const nameParts = newPatientName.trim().split(/\s+/)
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        if (!firstName) {
            setError('Please enter a valid patient name')
            return
        }

        try {
            setLoading(true)
            setError(null)

            const patientData = {
                firstName,
                lastName,
            }

            const response = await api.post('/api/patients', patientData)
            const newPatient = response.data.patient || response.data

            setFormData((prev) => ({
                ...prev,
                patientId: newPatient._id || newPatient.id || '',
                patientName: `${newPatient.firstName} ${newPatient.lastName}`,
            }))
            setIsNewPatient(false)
            setNewPatientName('')

            // Refresh patients list
            await fetchPatients()

            // Proceed to next step
            handleNext()
        } catch (err: any) {
            console.error('Error creating patient:', err)
            setError(err.response?.data?.message || 'Failed to create patient. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    /**
     * Handle next step
     */
    const handleNext = () => {
        // Validation based on current step
        if (activeStep === 0) {
            if (!formData.patientName) {
                setError('Please select or enter a patient name')
                return
            }
            // If it's a new patient, create it first
            if (isNewPatient && !formData.patientId) {
                handleCreateNewPatient()
                return
            }
        }
        if (activeStep === 1 && (!formData.appointmentDate || !formData.appointmentTime)) {
            setError('Please select a date and time')
            return
        }
        if (activeStep === 2 && !formData.appointmentType) {
            setError('Please select an appointment type')
            return
        }

        setError(null)
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    /**
     * Handle back step
     */
    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
        setError(null)
    }

    /**
     * Handle form submit
     */
    const handleSubmit = async () => {
        try {
            setSubmitting(true)
            setError(null)

            const appointmentData = {
                patientId: formData.patientId,
                patientName: formData.patientName,
                appointmentDate: formData.appointmentDate
                    ? new Date(`${formData.appointmentDate}T${formData.appointmentTime}`).toISOString()
                    : undefined,
                appointmentType: formData.appointmentType,
                duration: formData.duration,
                notes: formData.notes || undefined,
                status: 'scheduled',
            }

            await api.post('/api/appointments', appointmentData)
            setSuccess(true)
            setActiveStep(3)
        } catch (err: any) {
            console.error('Error creating appointment:', err)
            setError(err.response?.data?.message || 'Failed to create appointment. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    /**
     * Handle reset
     */
    const handleReset = () => {
        setFormData({
            patientId: '',
            patientName: '',
            appointmentDate: '',
            appointmentTime: '',
            appointmentType: '',
            duration: 60,
            notes: '',
        })
        setActiveStep(0)
        setError(null)
        setSuccess(false)
    }

    /**
     * Format date for display
     */
    const formatDate = (dateString: string) => {
        if (!dateString) return ''
        try {
            return new Date(dateString).toLocaleDateString('en-NZ', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
        } catch {
            return dateString
        }
    }

    /**
     * Format time for display
     */
    const formatTime = (timeString: string) => {
        if (!timeString) return ''
        const [hours, minutes] = timeString.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
    }

    /**
     * Get minimum date (today)
     */
    const getMinDate = () => {
        const today = new Date()
        return today.toISOString().split('T')[0]
    }

    /**
     * Render step content
     */
    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                        <Typography variant="h6" gutterBottom>
                            Select or Add Patient
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Search for an existing patient or enter a new patient name
                        </Typography>
                        <Autocomplete
                            freeSolo
                            options={patients}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') {
                                    return option
                                }
                                return `${option.firstName} ${option.lastName}${option.email ? ` (${option.email})` : ''}`
                            }}
                            value={
                                formData.patientId
                                    ? patients.find((p) => (p._id || p.id) === formData.patientId) || null
                                    : formData.patientName || null
                            }
                            onChange={(_event, newValue) => handlePatientSelect(newValue)}
                            onInputChange={(_event, newInputValue) => {
                                if (newInputValue && !patients.find((p) =>
                                    `${p.firstName} ${p.lastName}`.toLowerCase() === newInputValue.toLowerCase()
                                )) {
                                    // User is typing a new name
                                    handlePatientSelect(newInputValue)
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Patient Name *"
                                    required
                                    placeholder="Search existing patient or enter new patient name"
                                    helperText={
                                        isNewPatient
                                            ? 'New patient will be created automatically'
                                            : 'Select from existing patients or type a new name'
                                    }
                                />
                            )}
                            renderOption={(props, option) => {
                                if (typeof option === 'string') {
                                    return (
                                        <li {...props} key={option}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                                <Box>
                                                    <Typography variant="body1">{option}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        New patient
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </li>
                                    )
                                }
                                return (
                                    <li {...props} key={option._id || option.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PersonIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                                            <Box>
                                                <Typography variant="body1">
                                                    {option.firstName} {option.lastName}
                                                </Typography>
                                                {option.email && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {option.email}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </li>
                                )
                            }}
                        />
                        {isNewPatient && formData.patientName && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                A new patient record will be created for "{formData.patientName}" when you proceed to the next step.
                            </Alert>
                        )}
                    </Box>
                )

            case 1:
                const timeSlots = generateTimeSlots()
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Choose Date & Time
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Select a date and available time slot
                        </Typography>
                        <Grid container spacing={3} sx={{ maxWidth: 800, mx: 'auto' }}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Appointment Date *"
                                    type="date"
                                    value={formData.appointmentDate}
                                    onChange={(e) => handleFormChange('appointmentDate', e.target.value)}
                                    required
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    inputProps={{
                                        min: getMinDate(),
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Appointment Time *</InputLabel>
                                    <Select
                                        value={formData.appointmentTime}
                                        label="Appointment Time *"
                                        onChange={(e) => handleFormChange('appointmentTime', e.target.value)}
                                        disabled={!formData.appointmentDate}
                                    >
                                        {timeSlots.map((slot) => (
                                            <MenuItem key={slot.time} value={slot.time} disabled={!slot.available}>
                                                {formatTime(slot.time)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                )

            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Appointment Details
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Provide additional information about the appointment
                        </Typography>
                        <Grid container spacing={3} sx={{ maxWidth: 1000, mx: 'auto' }}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Appointment Type *</InputLabel>
                                    <Select
                                        value={formData.appointmentType}
                                        label="Appointment Type *"
                                        onChange={(e) => handleFormChange('appointmentType', e.target.value)}
                                    >
                                        <MenuItem value="consultation">Consultation</MenuItem>
                                        <MenuItem value="treatment">Treatment</MenuItem>
                                        <MenuItem value="follow-up">Follow-up</MenuItem>
                                        <MenuItem value="acupuncture">Acupuncture</MenuItem>
                                        <MenuItem value="herbal_medicine">Herbal Medicine</MenuItem>
                                        <MenuItem value="tuina">Tuina Massage</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Duration</InputLabel>
                                    <Select
                                        value={formData.duration}
                                        label="Duration"
                                        onChange={(e) => handleFormChange('duration', parseInt(String(e.target.value)))}
                                    >
                                        <MenuItem value={30}>30 minutes</MenuItem>
                                        <MenuItem value={60}>60 minutes</MenuItem>
                                        <MenuItem value={90}>90 minutes</MenuItem>
                                        <MenuItem value={120}>120 minutes</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Notes (Optional)"
                                    value={formData.notes}
                                    onChange={(e) => handleFormChange('notes', e.target.value)}
                                    multiline
                                    rows={4}
                                    placeholder="Any additional notes or special requirements..."
                                />
                            </Grid>
                        </Grid>
                    </Box>
                )

            case 3:
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        {success ? (
                            <>
                                <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                                <Typography variant="h5" gutterBottom>
                                    Appointment Booked Successfully!
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                    Your appointment has been confirmed.
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                    <Button variant="outlined" onClick={handleReset}>
                                        Book Another Appointment
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => router.push('/appointments')}
                                    >
                                        View Appointments
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Review Appointment Details
                                </Typography>
                                <Paper sx={{ p: 3, mt: 3, textAlign: 'left' }}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Patient
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {formData.patientName}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Date
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {formatDate(formData.appointmentDate)}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Time
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {formatTime(formData.appointmentTime)}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Type
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {formData.appointmentType}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Duration
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {formData.duration} minutes
                                            </Typography>
                                        </Grid>
                                        {formData.notes && (
                                            <Grid size={{ xs: 12 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Notes
                                                </Typography>
                                                <Typography variant="body1">{formData.notes}</Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Paper>
                            </Box>
                        )}
                    </Box>
                )

            default:
                return null
        }
    }

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
                        Book Appointment
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 0 }}>
                        Create a new appointment for a patient
                    </Typography>
                </Box>
            </Box>

            {/* Main Content Area */}
            <Box sx={{ px: 3, py: 3, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <Paper
                    sx={{
                        p: 4,
                        borderRadius: 2,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        width: '100%',
                        maxWidth: '100%',
                    }}
                >
                    {/* Stepper */}
                    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {/* Error Message */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Step Content */}
                    <Box sx={{ mb: 4, minHeight: 400 }}>
                        {renderStepContent(activeStep)}
                    </Box>

                    {/* Navigation Buttons */}
                    {activeStep < 3 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                disabled={activeStep === 0}
                                onClick={handleBack}
                            >
                                Back
                            </Button>
                            {activeStep === steps.length - 2 ? (
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    startIcon={submitting ? <CircularProgress size={16} /> : null}
                                    sx={{
                                        bgcolor: '#456086',
                                        '&:hover': {
                                            bgcolor: '#365070',
                                        },
                                    }}
                                >
                                    {submitting ? 'Booking...' : 'Book Appointment'}
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    sx={{
                                        bgcolor: '#456086',
                                        '&:hover': {
                                            bgcolor: '#365070',
                                        },
                                    }}
                                >
                                    Next
                                </Button>
                            )}
                        </Box>
                    )}
                </Paper>
            </Box>
        </div>
    )
}

