'use client'

import { useEffect, useState } from 'react'
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
    Card,
    CardContent,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Menu,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem as SelectMenuItem,
    Alert,
} from '@mui/material'
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    MoreVert as MoreVertIcon,
    FilterList as FilterListIcon,
    ViewList as ViewListIcon,
    ViewModule as ViewModuleIcon,
} from '@mui/icons-material'
import api from '@/lib/api'

type ViewMode = 'grid' | 'list'

interface Patient {
    _id?: string
    id?: string
    firstName: string
    lastName: string
    email?: string
    phone?: string
    dateOfBirth?: string
    gender?: string
    address?: string
    emergencyContact?: {
        name?: string
        phone?: string
    }
    medicalHistory?: string
    allergies?: string[]
    status?: string
    createdAt?: string
    updatedAt?: string
}

/**
 * Patients page - displays patient list with search and management features
 */
export default function Patients() {
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(12)
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [menuPatientId, setMenuPatientId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState<Partial<Patient>>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        emergencyContact: {
            name: '',
            phone: '',
        },
        medicalHistory: '',
        allergies: [],
    })

    useEffect(() => {
        fetchPatients()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /**
     * Fetch patients from the API
     */
    const fetchPatients = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await api.get('/api/patients')
            setPatients(response.data.patients || response.data || [])
        } catch (err: any) {
            console.error('Error fetching patients:', err)
            setError('Unable to fetch patients. Please ensure the backend server is running.')
            setPatients([])
        } finally {
            setLoading(false)
        }
    }

    /**
     * Filter patients based on search term
     */
    const filteredPatients = patients.filter((patient) => {
        if (!searchTerm) return true
        const searchLower = searchTerm.toLowerCase()
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase()
        return (
            fullName.includes(searchLower) ||
            patient.email?.toLowerCase().includes(searchLower) ||
            patient.phone?.toLowerCase().includes(searchLower) ||
            patient.address?.toLowerCase().includes(searchLower)
        )
    })

    /**
     * Get paginated patients
     */
    const paginatedPatients = filteredPatients.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    )

    /**
     * Handle page change
     */
    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage)
    }

    /**
     * Handle rows per page change
     */
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    /**
     * Handle menu open
     */
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, patientId: string) => {
        setAnchorEl(event.currentTarget)
        setMenuPatientId(patientId)
    }

    /**
     * Handle menu close
     */
    const handleMenuClose = () => {
        setAnchorEl(null)
        setMenuPatientId(null)
    }

    /**
     * Handle edit patient
     */
    const handleEdit = (patient: Patient) => {
        setSelectedPatient(patient)
        setFormData({
            firstName: patient.firstName || '',
            lastName: patient.lastName || '',
            email: patient.email || '',
            phone: patient.phone || '',
            dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
            gender: patient.gender || '',
            address: patient.address || '',
            emergencyContact: patient.emergencyContact || {
                name: '',
                phone: '',
            },
            medicalHistory: patient.medicalHistory || '',
            allergies: patient.allergies || [],
        })
        setFormError(null)
        setOpenDialog(true)
        handleMenuClose()
    }

    /**
     * Handle delete patient
     */
    const handleDelete = async (patientId: string) => {
        if (!window.confirm('Are you sure you want to delete this patient?')) {
            return
        }

        try {
            await api.delete(`/api/patients/${patientId}`)
            fetchPatients()
        } catch (err: any) {
            console.error('Error deleting patient:', err)
            alert('Failed to delete patient. Please try again.')
        }
        handleMenuClose()
    }

    /**
     * Handle add new patient
     */
    const handleAdd = () => {
        setSelectedPatient(null)
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            gender: '',
            address: '',
            emergencyContact: {
                name: '',
                phone: '',
            },
            medicalHistory: '',
            allergies: [],
        })
        setFormError(null)
        setOpenDialog(true)
    }

    /**
     * Handle dialog close
     */
    const handleDialogClose = () => {
        setOpenDialog(false)
        setSelectedPatient(null)
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            gender: '',
            address: '',
            emergencyContact: {
                name: '',
                phone: '',
            },
            medicalHistory: '',
            allergies: [],
        })
        setFormError(null)
    }

    /**
     * Handle form field change
     */
    const handleFormChange = (field: keyof Patient, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
        setFormError(null)
    }

    /**
     * Handle emergency contact change
     */
    const handleEmergencyContactChange = (field: 'name' | 'phone', value: string) => {
        setFormData((prev) => ({
            ...prev,
            emergencyContact: {
                ...prev.emergencyContact,
                [field]: value,
            },
        }))
        setFormError(null)
    }

    /**
     * Handle allergies change
     */
    const handleAllergiesChange = (value: string) => {
        // Split by comma and trim each allergy
        const allergies = value
            .split(',')
            .map((a) => a.trim())
            .filter((a) => a.length > 0)
        setFormData((prev) => ({
            ...prev,
            allergies,
        }))
        setFormError(null)
    }

    /**
     * Handle save patient
     */
    const handleSave = async () => {
        // Validation
        if (!formData.firstName || !formData.lastName) {
            setFormError('First name and last name are required')
            return
        }

        // Email validation if provided
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setFormError('Please enter a valid email address')
            return
        }

        try {
            setSaving(true)
            setFormError(null)

            const patientData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : undefined,
                gender: formData.gender || undefined,
                address: formData.address || undefined,
                emergencyContact: formData.emergencyContact?.name || formData.emergencyContact?.phone
                    ? {
                        name: formData.emergencyContact.name || undefined,
                        phone: formData.emergencyContact.phone || undefined,
                    }
                    : undefined,
                medicalHistory: formData.medicalHistory || undefined,
                allergies: formData.allergies && formData.allergies.length > 0 ? formData.allergies : undefined,
            }

            if (selectedPatient) {
                // Update existing patient
                const patientId = selectedPatient._id || selectedPatient.id
                await api.put(`/api/patients/${patientId}`, patientData)
            } else {
                // Create new patient
                await api.post('/api/patients', patientData)
            }

            // Refresh patients list
            await fetchPatients()
            handleDialogClose()
        } catch (err: any) {
            console.error('Error saving patient:', err)
            setFormError(
                err.response?.data?.message || 'Failed to save patient. Please try again.'
            )
        } finally {
            setSaving(false)
        }
    }

    /**
     * Format date
     */
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A'
        try {
            return new Date(dateString).toLocaleDateString('en-NZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
        } catch {
            return 'N/A'
        }
    }

    /**
     * Calculate age from date of birth
     */
    const calculateAge = (dateOfBirth?: string) => {
        if (!dateOfBirth) return 'N/A'
        try {
            const birthDate = new Date(dateOfBirth)
            const today = new Date()
            let age = today.getFullYear() - birthDate.getFullYear()
            const monthDiff = today.getMonth() - birthDate.getMonth()
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--
            }
            return age
        } catch {
            return 'N/A'
        }
    }

    /**
     * Get initials for avatar
     */
    const getInitials = (patient: Patient) => {
        const first = patient.firstName?.charAt(0) || ''
        const last = patient.lastName?.charAt(0) || ''
        return `${first}${last}`.toUpperCase()
    }

    /**
     * Render grid view
     */
    const renderGridView = () => {
        if (loading) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                    <CircularProgress />
                </Box>
            )
        }

        if (paginatedPatients.length === 0) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 400,
                        gap: 2,
                    }}
                >
                    <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary">
                        {searchTerm ? 'No patients found' : 'No patients yet'}
                    </Typography>
                    {!searchTerm && (
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
                            Add First Patient
                        </Button>
                    )}
                </Box>
            )
        }

        return (
            <Grid container spacing={3}>
                {paginatedPatients.map((patient) => {
                    const patientId = patient._id || patient.id || ''
                    return (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={patientId}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4,
                                    },
                                }}
                            >
                                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    {/* Header with Avatar and Menu */}
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                        <Avatar
                                            sx={{
                                                bgcolor: 'primary.main',
                                                width: 56,
                                                height: 56,
                                                fontSize: '1.5rem',
                                            }}
                                        >
                                            {getInitials(patient)}
                                        </Avatar>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, patientId)}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Box>

                                    {/* Patient Name */}
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {patient.firstName} {patient.lastName}
                                    </Typography>

                                    {/* Patient Info */}
                                    <Box sx={{ flex: 1 }}>
                                        {patient.email && (
                                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="body2" color="text.secondary" noWrap>
                                                    {patient.email}
                                                </Typography>
                                            </Box>
                                        )}
                                        {patient.phone && (
                                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {patient.phone}
                                                </Typography>
                                            </Box>
                                        )}
                                        {patient.dateOfBirth && (
                                            <Typography variant="body2" color="text.secondary" mb={1}>
                                                Age: {calculateAge(patient.dateOfBirth)}
                                            </Typography>
                                        )}
                                        {patient.gender && (
                                            <Chip
                                                label={patient.gender}
                                                size="small"
                                                sx={{ mt: 1 }}
                                            />
                                        )}
                                    </Box>

                                    {/* Footer */}
                                    <Box mt={2} pt={2} borderTop="1px solid #e0e0e0">
                                        <Typography variant="caption" color="text.secondary">
                                            Added: {formatDate(patient.createdAt)}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    )
                })}
            </Grid>
        )
    }

    /**
     * Render list view
     */
    const renderListView = () => {
        if (loading) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                    <CircularProgress />
                </Box>
            )
        }

        if (paginatedPatients.length === 0) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 400,
                        gap: 2,
                    }}
                >
                    <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary">
                        {searchTerm ? 'No patients found' : 'No patients yet'}
                    </Typography>
                    {!searchTerm && (
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
                            Add First Patient
                        </Button>
                    )}
                </Box>
            )
        }

        return (
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Patient</TableCell>
                            <TableCell>Contact</TableCell>
                            <TableCell>Date of Birth</TableCell>
                            <TableCell>Gender</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedPatients.map((patient) => {
                            const patientId = patient._id || patient.id || ''
                            return (
                                <TableRow
                                    key={patientId}
                                    sx={{
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        },
                                    }}
                                >
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: 'primary.main',
                                                    width: 40,
                                                    height: 40,
                                                }}
                                            >
                                                {getInitials(patient)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {patient.firstName} {patient.lastName}
                                                </Typography>
                                                {patient.email && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {patient.email}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {patient.phone && (
                                            <Typography variant="body2">{patient.phone}</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {patient.dateOfBirth
                                                ? `${formatDate(patient.dateOfBirth)} (Age: ${calculateAge(patient.dateOfBirth)})`
                                                : 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {patient.gender ? (
                                            <Chip label={patient.gender} size="small" />
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                N/A
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={patient.status || 'Active'}
                                            color={patient.status === 'Active' ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, patientId)}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        )
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
                        Patients
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 0 }}>
                        Manage patient records and information
                    </Typography>
                </Box>
            </Box>

            {/* Main Content Area */}
            <Box sx={{ px: 3, py: 3, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {/* Action Bar */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3,
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <TextField
                        placeholder="Search patients..."
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setPage(0)
                        }}
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={viewMode === 'grid' ? 'List View' : 'Grid View'}>
                            <IconButton
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                sx={{
                                    border: '1px solid #e0e0e0',
                                    bgcolor: '#ffffff',
                                }}
                            >
                                {viewMode === 'grid' ? <ViewListIcon /> : <ViewModuleIcon />}
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAdd}
                            sx={{
                                bgcolor: '#456086',
                                '&:hover': {
                                    bgcolor: '#365070',
                                },
                            }}
                        >
                            New Patient
                        </Button>
                    </Box>
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

                {/* Patients List/Grid */}
                <Paper
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                    }}
                >
                    {/* Stats */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Showing {paginatedPatients.length} of {filteredPatients.length} patients
                        </Typography>
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                        {viewMode === 'grid' ? renderGridView() : renderListView()}
                    </Box>

                    {/* Pagination */}
                    {filteredPatients.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <TablePagination
                                component="div"
                                count={filteredPatients.length}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                rowsPerPageOptions={[6, 12, 24, 48]}
                            />
                        </Box>
                    )}
                </Paper>
            </Box>

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem
                    onClick={() => {
                        const patient = patients.find((p) => (p._id || p.id) === menuPatientId)
                        if (patient) handleEdit(patient)
                    }}
                >
                    <EditIcon sx={{ mr: 1, fontSize: 18 }} />
                    Edit
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (menuPatientId) handleDelete(menuPatientId)
                    }}
                    sx={{ color: 'error.main' }}
                >
                    <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
                    Delete
                </MenuItem>
            </Menu>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedPatient ? 'Edit Patient' : 'Add New Patient'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        {formError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {formError}
                            </Alert>
                        )}

                        <Grid container spacing={3}>
                            {/* First Name */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="First Name *"
                                    value={formData.firstName || ''}
                                    onChange={(e) => handleFormChange('firstName', e.target.value)}
                                    required
                                />
                            </Grid>

                            {/* Last Name */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Last Name *"
                                    value={formData.lastName || ''}
                                    onChange={(e) => handleFormChange('lastName', e.target.value)}
                                    required
                                />
                            </Grid>

                            {/* Email */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => handleFormChange('email', e.target.value)}
                                    placeholder="patient@example.com"
                                />
                            </Grid>

                            {/* Phone */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    value={formData.phone || ''}
                                    onChange={(e) => handleFormChange('phone', e.target.value)}
                                    placeholder="+64 21 123 4567"
                                />
                            </Grid>

                            {/* Date of Birth */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Date of Birth"
                                    type="date"
                                    value={formData.dateOfBirth || ''}
                                    onChange={(e) => handleFormChange('dateOfBirth', e.target.value)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>

                            {/* Gender */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Gender</InputLabel>
                                    <Select
                                        value={formData.gender || ''}
                                        label="Gender"
                                        onChange={(e) => handleFormChange('gender', e.target.value)}
                                    >
                                        <SelectMenuItem value="male">Male</SelectMenuItem>
                                        <SelectMenuItem value="female">Female</SelectMenuItem>
                                        <SelectMenuItem value="other">Other</SelectMenuItem>
                                        <SelectMenuItem value="prefer-not-to-say">Prefer not to say</SelectMenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Address */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    value={formData.address || ''}
                                    onChange={(e) => handleFormChange('address', e.target.value)}
                                    multiline
                                    rows={2}
                                    placeholder="Street address, City, Postal code"
                                />
                            </Grid>

                            {/* Emergency Contact Section */}
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    Emergency Contact
                                </Typography>
                            </Grid>

                            {/* Emergency Contact Name */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Emergency Contact Name"
                                    value={formData.emergencyContact?.name || ''}
                                    onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                                    placeholder="Full name"
                                />
                            </Grid>

                            {/* Emergency Contact Phone */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Emergency Contact Phone"
                                    value={formData.emergencyContact?.phone || ''}
                                    onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                                    placeholder="+64 21 123 4567"
                                />
                            </Grid>

                            {/* Medical History */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Medical History"
                                    value={formData.medicalHistory || ''}
                                    onChange={(e) => handleFormChange('medicalHistory', e.target.value)}
                                    multiline
                                    rows={4}
                                    placeholder="Previous medical conditions, surgeries, medications, etc."
                                />
                            </Grid>

                            {/* Allergies */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Allergies"
                                    value={(formData.allergies || []).join(', ')}
                                    onChange={(e) => handleAllergiesChange(e.target.value)}
                                    multiline
                                    rows={2}
                                    placeholder="Enter allergies separated by commas (e.g., Peanuts, Penicillin)"
                                    helperText="Separate multiple allergies with commas"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleDialogClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} /> : null}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

