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
    Autocomplete,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material'
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Assignment as AssignmentIcon,
    Person as PersonIcon,
    CalendarToday as CalendarIcon,
    ExpandMore as ExpandMoreIcon,
    MoreVert as MoreVertIcon,
    ViewList as ViewListIcon,
    ViewModule as ViewModuleIcon,
    Description as DescriptionIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
    Cancel as CancelIcon,
    OpenInNew as OpenInNewIcon,
} from '@mui/icons-material'
import api from '@/lib/api'

type ViewMode = 'grid' | 'list'

interface ACCApplication {
    _id?: string
    id?: string
    patientId?: string
    patientName?: string
    caseId?: string
    caseNumber?: string
    applicationNumber?: string
    injuryDate?: string
    injuryDescription?: string
    treatmentDescription?: string
    status?: string
    submittedDate?: string
    approvedDate?: string
    rejectedDate?: string
    rejectionReason?: string
    notes?: string
    createdAt?: string
    updatedAt?: string
}

interface Patient {
    _id?: string
    id?: string
    firstName: string
    lastName: string
    email?: string
}

interface CaseRecord {
    _id?: string
    id?: string
    caseNumber?: string
    patientName?: string
}

/**
 * ACC Applications page - displays ACC application records with search and management features
 */
export default function ACCApplications() {
    const [applications, setApplications] = useState<ACCApplication[]>([])
    const [patients, setPatients] = useState<Patient[]>([])
    const [cases, setCases] = useState<CaseRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(12)
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedApplication, setSelectedApplication] = useState<ACCApplication | null>(null)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [menuApplicationId, setMenuApplicationId] = useState<string | null>(null)
    const [expandedApplication, setExpandedApplication] = useState<string | false>(false)
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState<Partial<ACCApplication>>({
        patientId: '',
        patientName: '',
        caseId: '',
        caseNumber: '',
        applicationNumber: '',
        injuryDate: '',
        injuryDescription: '',
        treatmentDescription: '',
        status: 'pending',
        submittedDate: '',
        notes: '',
    })

    useEffect(() => {
        fetchApplications()
        fetchPatients()
        fetchCases()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /**
     * Fetch ACC applications from the API
     */
    const fetchApplications = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await api.get('/api/acc')
            setApplications(response.data.applications || response.data || [])
        } catch (err: any) {
            console.error('Error fetching ACC applications:', err)
            setError('Unable to fetch ACC applications. Please ensure the backend server is running.')
            setApplications([])
        } finally {
            setLoading(false)
        }
    }

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
     * Fetch cases from the API
     */
    const fetchCases = async () => {
        try {
            const response = await api.get('/api/cases')
            setCases(response.data.cases || response.data || [])
        } catch (err: any) {
            console.error('Error fetching cases:', err)
        }
    }

    /**
     * Filter applications based on search term and status
     */
    const filteredApplications = applications.filter((application) => {
        // Status filter
        if (statusFilter !== 'all' && application.status !== statusFilter) {
            return false
        }

        // Search filter
        if (!searchTerm) return true
        const searchLower = searchTerm.toLowerCase()
        return (
            application.patientName?.toLowerCase().includes(searchLower) ||
            application.applicationNumber?.toLowerCase().includes(searchLower) ||
            application.caseNumber?.toLowerCase().includes(searchLower) ||
            application.injuryDescription?.toLowerCase().includes(searchLower) ||
            application.treatmentDescription?.toLowerCase().includes(searchLower) ||
            application.notes?.toLowerCase().includes(searchLower)
        )
    })

    /**
     * Get paginated applications
     */
    const paginatedApplications = filteredApplications.slice(
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
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, applicationId: string) => {
        setAnchorEl(event.currentTarget)
        setMenuApplicationId(applicationId)
    }

    /**
     * Handle menu close
     */
    const handleMenuClose = () => {
        setAnchorEl(null)
        setMenuApplicationId(null)
    }

    /**
     * Handle edit application
     */
    const handleEdit = (application: ACCApplication) => {
        setSelectedApplication(application)
        setFormData({
            patientId: application.patientId || '',
            patientName: application.patientName || '',
            caseId: application.caseId || '',
            caseNumber: application.caseNumber || '',
            applicationNumber: application.applicationNumber || '',
            injuryDate: application.injuryDate ? new Date(application.injuryDate).toISOString().split('T')[0] : '',
            injuryDescription: application.injuryDescription || '',
            treatmentDescription: application.treatmentDescription || '',
            status: application.status || 'pending',
            submittedDate: application.submittedDate ? new Date(application.submittedDate).toISOString().split('T')[0] : '',
            notes: application.notes || '',
        })
        setFormError(null)
        setOpenDialog(true)
        handleMenuClose()
    }

    /**
     * Handle delete application
     */
    const handleDelete = async (applicationId: string) => {
        if (!window.confirm('Are you sure you want to delete this ACC application?')) {
            return
        }

        try {
            await api.delete(`/api/acc/${applicationId}`)
            fetchApplications()
        } catch (err: any) {
            console.error('Error deleting ACC application:', err)
            alert('Failed to delete ACC application. Please try again.')
        }
        handleMenuClose()
    }

    /**
     * Handle add new application
     */
    const handleAdd = () => {
        setSelectedApplication(null)
        setFormData({
            patientId: '',
            patientName: '',
            caseId: '',
            caseNumber: '',
            applicationNumber: '',
            injuryDate: '',
            injuryDescription: '',
            treatmentDescription: '',
            status: 'pending',
            submittedDate: new Date().toISOString().split('T')[0],
            notes: '',
        })
        setFormError(null)
        setOpenDialog(true)
    }

    /**
     * Handle dialog close
     */
    const handleDialogClose = () => {
        setOpenDialog(false)
        setSelectedApplication(null)
        setFormData({
            patientId: '',
            patientName: '',
            caseId: '',
            caseNumber: '',
            applicationNumber: '',
            injuryDate: '',
            injuryDescription: '',
            treatmentDescription: '',
            status: 'pending',
            submittedDate: '',
            notes: '',
        })
        setFormError(null)
    }

    /**
     * Handle form field change
     */
    const handleFormChange = (field: keyof ACCApplication, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
        setFormError(null)
    }

    /**
     * Handle patient selection
     */
    const handlePatientSelect = (patient: Patient | null) => {
        if (patient) {
            setFormData((prev) => ({
                ...prev,
                patientId: patient._id || patient.id || '',
                patientName: `${patient.firstName} ${patient.lastName}`,
            }))
        } else {
            setFormData((prev) => ({
                ...prev,
                patientId: '',
                patientName: '',
            }))
        }
        setFormError(null)
    }

    /**
     * Handle case selection
     */
    const handleCaseSelect = (caseRecord: CaseRecord | null) => {
        if (caseRecord) {
            setFormData((prev) => ({
                ...prev,
                caseId: caseRecord._id || caseRecord.id || '',
                caseNumber: caseRecord.caseNumber || '',
            }))
        } else {
            setFormData((prev) => ({
                ...prev,
                caseId: '',
                caseNumber: '',
            }))
        }
        setFormError(null)
    }

    /**
     * Handle save application
     */
    const handleSave = async () => {
        // Validation
        if (!formData.patientId || !formData.patientName) {
            setFormError('Please select a patient')
            return
        }
        if (!formData.injuryDate) {
            setFormError('Injury date is required')
            return
        }
        if (!formData.injuryDescription) {
            setFormError('Injury description is required')
            return
        }

        try {
            setSaving(true)
            setFormError(null)

            const applicationData = {
                patientId: formData.patientId,
                patientName: formData.patientName,
                caseId: formData.caseId || undefined,
                caseNumber: formData.caseNumber || undefined,
                applicationNumber: formData.applicationNumber || undefined,
                injuryDate: formData.injuryDate ? new Date(formData.injuryDate).toISOString() : undefined,
                injuryDescription: formData.injuryDescription,
                treatmentDescription: formData.treatmentDescription || undefined,
                status: formData.status || 'pending',
                submittedDate: formData.submittedDate ? new Date(formData.submittedDate).toISOString() : undefined,
                notes: formData.notes || undefined,
            }

            if (selectedApplication) {
                // Update existing application
                const applicationId = selectedApplication._id || selectedApplication.id
                await api.put(`/api/acc/${applicationId}`, applicationData)
            } else {
                // Create new application
                await api.post('/api/acc', applicationData)
            }

            // Refresh applications list
            await fetchApplications()
            handleDialogClose()
        } catch (err: any) {
            console.error('Error saving ACC application:', err)
            setFormError(
                err.response?.data?.message || 'Failed to save ACC application. Please try again.'
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
     * Get status color
     */
    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
            case 'completed':
                return 'success'
            case 'pending':
            case 'submitted':
                return 'warning'
            case 'rejected':
            case 'cancelled':
                return 'error'
            case 'in_progress':
            case 'processing':
                return 'info'
            default:
                return 'default'
        }
    }

    /**
     * Get status icon
     */
    const getStatusIcon = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
            case 'completed':
                return <CheckCircleIcon />
            case 'pending':
            case 'submitted':
                return <PendingIcon />
            case 'rejected':
            case 'cancelled':
                return <CancelIcon />
            default:
                return <AssignmentIcon />
        }
    }

    /**
     * Handle accordion expand
     */
    const handleAccordionChange = (applicationId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedApplication(isExpanded ? applicationId : false)
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

        if (paginatedApplications.length === 0) {
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
                    <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary">
                        {searchTerm || statusFilter !== 'all' ? 'No ACC applications found' : 'No ACC applications yet'}
                    </Typography>
                    {!searchTerm && statusFilter === 'all' && (
                        <Button
                            variant="contained"
                            startIcon={<OpenInNewIcon />}
                            onClick={() => window.open('https://providerhub.acc.co.nz/s/login/', '_blank')}
                            sx={{
                                bgcolor: '#1D7D81',
                                '&:hover': {
                                    bgcolor: '#156d71',
                                },
                            }}
                        >
                            Apply on ACC Website
                        </Button>
                    )}
                </Box>
            )
        }

        return (
            <Grid container spacing={3}>
                {paginatedApplications.map((application) => {
                    const applicationId = application._id || application.id || ''
                    return (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={applicationId}>
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
                                    {/* Header with Icon and Menu */}
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                        <Avatar
                                            sx={{
                                                bgcolor: 'primary.main',
                                                width: 56,
                                                height: 56,
                                            }}
                                        >
                                            <AssignmentIcon />
                                        </Avatar>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, applicationId)}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Box>

                                    {/* Application Number */}
                                    {application.applicationNumber && (
                                        <Typography variant="caption" color="text.secondary" gutterBottom>
                                            Application #{application.applicationNumber}
                                        </Typography>
                                    )}

                                    {/* Patient Name */}
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {application.patientName || 'Unknown Patient'}
                                    </Typography>

                                    {/* Injury Description */}
                                    {application.injuryDescription && (
                                        <Box mb={2}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Injury:
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {application.injuryDescription.length > 100
                                                    ? `${application.injuryDescription.substring(0, 100)}...`
                                                    : application.injuryDescription}
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Status and Date */}
                                    <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #e0e0e0' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            {application.status && (
                                                <Chip
                                                    icon={getStatusIcon(application.status)}
                                                    label={application.status}
                                                    color={getStatusColor(application.status) as any}
                                                    size="small"
                                                />
                                            )}
                                        </Box>
                                        {application.injuryDate && (
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    Injury: {formatDate(application.injuryDate)}
                                                </Typography>
                                            </Box>
                                        )}
                                        {application.submittedDate && (
                                            <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                                <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    Submitted: {formatDate(application.submittedDate)}
                                                </Typography>
                                            </Box>
                                        )}
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

        if (paginatedApplications.length === 0) {
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
                    <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary">
                        {searchTerm || statusFilter !== 'all' ? 'No ACC applications found' : 'No ACC applications yet'}
                    </Typography>
                    {!searchTerm && statusFilter === 'all' && (
                        <Button
                            variant="contained"
                            startIcon={<OpenInNewIcon />}
                            onClick={() => window.open('https://providerhub.acc.co.nz/s/login/', '_blank')}
                            sx={{
                                bgcolor: '#1D7D81',
                                '&:hover': {
                                    bgcolor: '#156d71',
                                },
                            }}
                        >
                            Apply on ACC Website
                        </Button>
                    )}
                </Box>
            )
        }

        return (
            <Box>
                {paginatedApplications.map((application) => {
                    const applicationId = application._id || application.id || ''
                    return (
                        <Accordion
                            key={applicationId}
                            expanded={expandedApplication === applicationId}
                            onChange={handleAccordionChange(applicationId)}
                            sx={{
                                mb: 2,
                                '&:before': {
                                    display: 'none',
                                },
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: 'primary.main',
                                            width: 40,
                                            height: 40,
                                        }}
                                    >
                                        <AssignmentIcon />
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {application.patientName || 'Unknown Patient'}
                                            </Typography>
                                            {application.applicationNumber && (
                                                <Typography variant="caption" color="text.secondary">
                                                    (#{application.applicationNumber})
                                                </Typography>
                                            )}
                                            {application.status && (
                                                <Chip
                                                    icon={getStatusIcon(application.status)}
                                                    label={application.status}
                                                    color={getStatusColor(application.status) as any}
                                                    size="small"
                                                />
                                            )}
                                        </Box>
                                        {application.injuryDescription && (
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {application.injuryDescription}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        {application.injuryDate && (
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDate(application.injuryDate)}
                                            </Typography>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleMenuOpen(e, applicationId)
                                            }}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    {application.injuryDescription && (
                                        <Grid size={{ xs: 12 }}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Injury Description:
                                            </Typography>
                                            <Typography variant="body2">{application.injuryDescription}</Typography>
                                        </Grid>
                                    )}
                                    {application.treatmentDescription && (
                                        <Grid size={{ xs: 12 }}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Treatment Description:
                                            </Typography>
                                            <Typography variant="body2">{application.treatmentDescription}</Typography>
                                        </Grid>
                                    )}
                                    {application.notes && (
                                        <Grid size={{ xs: 12 }}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Notes:
                                            </Typography>
                                            <Typography variant="body2">{application.notes}</Typography>
                                        </Grid>
                                    )}
                                    {application.rejectionReason && (
                                        <Grid size={{ xs: 12 }}>
                                            <Alert severity="error">
                                                <Typography variant="body2" fontWeight="bold" gutterBottom>
                                                    Rejection Reason:
                                                </Typography>
                                                <Typography variant="body2">{application.rejectionReason}</Typography>
                                            </Alert>
                                        </Grid>
                                    )}
                                    <Grid size={{ xs: 12 }}>
                                        <Box display="flex" gap={2} flexWrap="wrap">
                                            {application.injuryDate && (
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Injury Date:
                                                    </Typography>
                                                    <Typography variant="body2">{formatDate(application.injuryDate)}</Typography>
                                                </Box>
                                            )}
                                            {application.submittedDate && (
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Submitted:
                                                    </Typography>
                                                    <Typography variant="body2">{formatDate(application.submittedDate)}</Typography>
                                                </Box>
                                            )}
                                            {application.approvedDate && (
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Approved:
                                                    </Typography>
                                                    <Typography variant="body2">{formatDate(application.approvedDate)}</Typography>
                                                </Box>
                                            )}
                                            {application.rejectedDate && (
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Rejected:
                                                    </Typography>
                                                    <Typography variant="body2">{formatDate(application.rejectedDate)}</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    )
                })}
            </Box>
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
                        ACC Applications
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 0 }}>
                        Manage ACC (Accident Compensation Corporation) applications and claims
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
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 1 }}>
                        <TextField
                            placeholder="Search ACC applications..."
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setPage(0)
                            }}
                            sx={{
                                width: { xs: '100%', sm: '300px' },
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
                        <FormControl size="small" sx={{ minWidth: 150, bgcolor: '#ffffff' }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => {
                                    setStatusFilter(e.target.value)
                                    setPage(0)
                                }}
                            >
                                <SelectMenuItem value="all">All Status</SelectMenuItem>
                                <SelectMenuItem value="pending">Pending</SelectMenuItem>
                                <SelectMenuItem value="submitted">Submitted</SelectMenuItem>
                                <SelectMenuItem value="approved">Approved</SelectMenuItem>
                                <SelectMenuItem value="rejected">Rejected</SelectMenuItem>
                                <SelectMenuItem value="in_progress">In Progress</SelectMenuItem>
                            </Select>
                        </FormControl>
                    </Box>
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
                            startIcon={<OpenInNewIcon />}
                            onClick={() => window.open('https://providerhub.acc.co.nz/s/login/', '_blank')}
                            sx={{
                                bgcolor: '#1D7D81',
                                '&:hover': {
                                    bgcolor: '#156d71',
                                },
                            }}
                        >
                            Apply on ACC Website
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

                {/* Applications List/Grid */}
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
                            Showing {paginatedApplications.length} of {filteredApplications.length} ACC applications
                        </Typography>
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                        {viewMode === 'grid' ? renderGridView() : renderListView()}
                    </Box>

                    {/* Pagination */}
                    {filteredApplications.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <TablePagination
                                component="div"
                                count={filteredApplications.length}
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
                        const application = applications.find((a) => (a._id || a.id) === menuApplicationId)
                        if (application) handleEdit(application)
                    }}
                >
                    <EditIcon sx={{ mr: 1, fontSize: 18 }} />
                    Edit
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (menuApplicationId) handleDelete(menuApplicationId)
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
                    {selectedApplication ? 'Edit ACC Application' : 'Add New ACC Application'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        {formError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {formError}
                            </Alert>
                        )}

                        <Grid container spacing={3}>
                            {/* Patient Selection */}
                            <Grid size={{ xs: 12 }}>
                                <Autocomplete
                                    options={patients}
                                    getOptionLabel={(option) =>
                                        `${option.firstName} ${option.lastName}${option.email ? ` (${option.email})` : ''}`
                                    }
                                    value={
                                        patients.find(
                                            (p) => (p._id || p.id) === formData.patientId
                                        ) || null
                                    }
                                    onChange={(_event, newValue) => handlePatientSelect(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Patient *"
                                            required
                                            placeholder="Search and select a patient"
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Case Selection */}
                            <Grid size={{ xs: 12 }}>
                                <Autocomplete
                                    options={cases.filter((c) =>
                                        !formData.patientId ||
                                        c.patientName === formData.patientName
                                    )}
                                    getOptionLabel={(option) =>
                                        `Case #${option.caseNumber || 'N/A'} - ${option.patientName || 'Unknown'}`
                                    }
                                    value={
                                        cases.find(
                                            (c) => (c._id || c.id) === formData.caseId
                                        ) || null
                                    }
                                    onChange={(_event, newValue) => handleCaseSelect(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Related Case (Optional)"
                                            placeholder="Select a related case record"
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Application Number */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Application Number"
                                    value={formData.applicationNumber || ''}
                                    onChange={(e) => handleFormChange('applicationNumber', e.target.value)}
                                    placeholder="Auto-generated if left empty"
                                />
                            </Grid>

                            {/* Status */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={formData.status || 'pending'}
                                        label="Status"
                                        onChange={(e) => handleFormChange('status', e.target.value)}
                                    >
                                        <SelectMenuItem value="pending">Pending</SelectMenuItem>
                                        <SelectMenuItem value="submitted">Submitted</SelectMenuItem>
                                        <SelectMenuItem value="in_progress">In Progress</SelectMenuItem>
                                        <SelectMenuItem value="approved">Approved</SelectMenuItem>
                                        <SelectMenuItem value="rejected">Rejected</SelectMenuItem>
                                        <SelectMenuItem value="cancelled">Cancelled</SelectMenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Injury Date */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Injury Date *"
                                    type="date"
                                    value={formData.injuryDate || ''}
                                    onChange={(e) => handleFormChange('injuryDate', e.target.value)}
                                    required
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>

                            {/* Submitted Date */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Submitted Date"
                                    type="date"
                                    value={formData.submittedDate || ''}
                                    onChange={(e) => handleFormChange('submittedDate', e.target.value)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>

                            {/* Injury Description */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Injury Description *"
                                    value={formData.injuryDescription || ''}
                                    onChange={(e) => handleFormChange('injuryDescription', e.target.value)}
                                    required
                                    multiline
                                    rows={4}
                                    placeholder="Describe the injury in detail..."
                                />
                            </Grid>

                            {/* Treatment Description */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Treatment Description"
                                    value={formData.treatmentDescription || ''}
                                    onChange={(e) => handleFormChange('treatmentDescription', e.target.value)}
                                    multiline
                                    rows={4}
                                    placeholder="Describe the treatment provided..."
                                />
                            </Grid>

                            {/* Notes */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Additional Notes"
                                    value={formData.notes || ''}
                                    onChange={(e) => handleFormChange('notes', e.target.value)}
                                    multiline
                                    rows={3}
                                    placeholder="Any additional notes or information..."
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

