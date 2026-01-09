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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    FormControl,
    InputLabel,
    Select,
    MenuItem as SelectMenuItem,
    Autocomplete,
    Alert,
} from '@mui/material'
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Description as DescriptionIcon,
    Person as PersonIcon,
    CalendarToday as CalendarIcon,
    ExpandMore as ExpandMoreIcon,
    MoreVert as MoreVertIcon,
    ViewList as ViewListIcon,
    ViewModule as ViewModuleIcon,
    Visibility as VisibilityIcon,
    LocalHospital as LocalHospitalIcon,
} from '@mui/icons-material'
import api from '@/lib/api'

type ViewMode = 'grid' | 'list'

interface CaseRecord {
    _id?: string
    id?: string
    patientId?: string
    patientName?: string
    caseNumber?: string
    chiefComplaint?: string
    diagnosis?: string
    treatment?: string
    notes?: string
    status?: string
    visitDate?: string
    nextVisitDate?: string
    createdAt?: string
    updatedAt?: string
}

/**
 * Case Records page - displays medical case records with search and management features
 */
interface Patient {
    _id?: string
    id?: string
    firstName: string
    lastName: string
    email?: string
    phone?: string
}

export default function CaseRecords() {
    const [cases, setCases] = useState<CaseRecord[]>([])
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(12)
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [menuCaseId, setMenuCaseId] = useState<string | null>(null)
    const [expandedCase, setExpandedCase] = useState<string | false>(false)
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState<Partial<CaseRecord>>({
        patientId: '',
        patientName: '',
        caseNumber: '',
        chiefComplaint: '',
        diagnosis: '',
        treatment: '',
        notes: '',
        status: 'active',
        visitDate: '',
        nextVisitDate: '',
    })

    useEffect(() => {
        fetchCases()
        fetchPatients()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /**
     * Fetch case records from the API
     */
    const fetchCases = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await api.get('/api/cases')
            setCases(response.data.cases || response.data || [])
        } catch (err: any) {
            console.error('Error fetching cases:', err)
            setError('Unable to fetch case records. Please ensure the backend server is running.')
            setCases([])
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
            // Don't show error for patients, just log it
        }
    }

    /**
     * Filter cases based on search term
     */
    const filteredCases = cases.filter((caseRecord) => {
        if (!searchTerm) return true
        const searchLower = searchTerm.toLowerCase()
        return (
            caseRecord.patientName?.toLowerCase().includes(searchLower) ||
            caseRecord.caseNumber?.toLowerCase().includes(searchLower) ||
            caseRecord.chiefComplaint?.toLowerCase().includes(searchLower) ||
            caseRecord.diagnosis?.toLowerCase().includes(searchLower) ||
            caseRecord.treatment?.toLowerCase().includes(searchLower) ||
            caseRecord.notes?.toLowerCase().includes(searchLower)
        )
    })

    /**
     * Get paginated cases
     */
    const paginatedCases = filteredCases.slice(
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
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, caseId: string) => {
        setAnchorEl(event.currentTarget)
        setMenuCaseId(caseId)
    }

    /**
     * Handle menu close
     */
    const handleMenuClose = () => {
        setAnchorEl(null)
        setMenuCaseId(null)
    }

    /**
     * Handle edit case
     */
    const handleEdit = (caseRecord: CaseRecord) => {
        setSelectedCase(caseRecord)
        setFormData({
            patientId: caseRecord.patientId || '',
            patientName: caseRecord.patientName || '',
            caseNumber: caseRecord.caseNumber || '',
            chiefComplaint: caseRecord.chiefComplaint || '',
            diagnosis: caseRecord.diagnosis || '',
            treatment: caseRecord.treatment || '',
            notes: caseRecord.notes || '',
            status: caseRecord.status || 'active',
            visitDate: caseRecord.visitDate ? new Date(caseRecord.visitDate).toISOString().split('T')[0] : '',
            nextVisitDate: caseRecord.nextVisitDate ? new Date(caseRecord.nextVisitDate).toISOString().split('T')[0] : '',
        })
        setFormError(null)
        setOpenDialog(true)
        handleMenuClose()
    }

    /**
     * Handle delete case
     */
    const handleDelete = async (caseId: string) => {
        if (!window.confirm('Are you sure you want to delete this case record?')) {
            return
        }

        try {
            await api.delete(`/api/cases/${caseId}`)
            fetchCases()
        } catch (err: any) {
            console.error('Error deleting case:', err)
            alert('Failed to delete case record. Please try again.')
        }
        handleMenuClose()
    }

    /**
     * Handle add new case
     */
    const handleAdd = () => {
        setSelectedCase(null)
        setFormData({
            patientId: '',
            patientName: '',
            caseNumber: '',
            chiefComplaint: '',
            diagnosis: '',
            treatment: '',
            notes: '',
            status: 'active',
            visitDate: new Date().toISOString().split('T')[0],
            nextVisitDate: '',
        })
        setFormError(null)
        setOpenDialog(true)
    }

    /**
     * Handle dialog close
     */
    const handleDialogClose = () => {
        setOpenDialog(false)
        setSelectedCase(null)
        setFormData({
            patientId: '',
            patientName: '',
            caseNumber: '',
            chiefComplaint: '',
            diagnosis: '',
            treatment: '',
            notes: '',
            status: 'active',
            visitDate: '',
            nextVisitDate: '',
        })
        setFormError(null)
    }

    /**
     * Handle form field change
     */
    const handleFormChange = (field: keyof CaseRecord, value: any) => {
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
     * Handle save case
     */
    const handleSave = async () => {
        // Validation
        if (!formData.patientId || !formData.patientName) {
            setFormError('Please select a patient')
            return
        }
        if (!formData.chiefComplaint) {
            setFormError('Chief complaint is required')
            return
        }
        if (!formData.visitDate) {
            setFormError('Visit date is required')
            return
        }

        try {
            setSaving(true)
            setFormError(null)

            const caseData = {
                patientId: formData.patientId,
                patientName: formData.patientName,
                caseNumber: formData.caseNumber || undefined,
                chiefComplaint: formData.chiefComplaint,
                diagnosis: formData.diagnosis || undefined,
                treatment: formData.treatment || undefined,
                notes: formData.notes || undefined,
                status: formData.status || 'active',
                visitDate: formData.visitDate ? new Date(formData.visitDate).toISOString() : undefined,
                nextVisitDate: formData.nextVisitDate ? new Date(formData.nextVisitDate).toISOString() : undefined,
            }

            if (selectedCase) {
                // Update existing case
                const caseId = selectedCase._id || selectedCase.id
                await api.put(`/api/cases/${caseId}`, caseData)
            } else {
                // Create new case
                await api.post('/api/cases', caseData)
            }

            // Refresh cases list
            await fetchCases()
            handleDialogClose()
        } catch (err: any) {
            console.error('Error saving case:', err)
            setFormError(
                err.response?.data?.message || 'Failed to save case record. Please try again.'
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
     * Format date and time
     */
    const formatDateTime = (dateString?: string) => {
        if (!dateString) return 'N/A'
        try {
            return new Date(dateString).toLocaleString('en-NZ', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
        } catch {
            return 'N/A'
        }
    }

    /**
     * Get initials for avatar
     */
    const getInitials = (caseRecord: CaseRecord) => {
        if (caseRecord.patientName) {
            const names = caseRecord.patientName.split(' ')
            const first = names[0]?.charAt(0) || ''
            const last = names[names.length - 1]?.charAt(0) || ''
            return `${first}${last}`.toUpperCase()
        }
        return 'CR'
    }

    /**
     * Get status color
     */
    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'ongoing':
                return 'primary'
            case 'completed':
            case 'closed':
                return 'success'
            case 'pending':
                return 'warning'
            case 'cancelled':
                return 'error'
            default:
                return 'default'
        }
    }

    /**
     * Handle accordion expand
     */
    const handleAccordionChange = (caseId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedCase(isExpanded ? caseId : false)
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

        if (paginatedCases.length === 0) {
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
                    <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary">
                        {searchTerm ? 'No case records found' : 'No case records yet'}
                    </Typography>
                    {!searchTerm && (
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
                            Add First Case Record
                        </Button>
                    )}
                </Box>
            )
        }

        return (
            <Grid container spacing={3}>
                {paginatedCases.map((caseRecord) => {
                    const caseId = caseRecord._id || caseRecord.id || ''
                    return (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={caseId}>
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
                                                bgcolor: 'secondary.main',
                                                width: 56,
                                                height: 56,
                                                fontSize: '1.5rem',
                                            }}
                                        >
                                            {getInitials(caseRecord)}
                                        </Avatar>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, caseId)}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Box>

                                    {/* Case Number */}
                                    {caseRecord.caseNumber && (
                                        <Typography variant="caption" color="text.secondary" gutterBottom>
                                            Case #{caseRecord.caseNumber}
                                        </Typography>
                                    )}

                                    {/* Patient Name */}
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {caseRecord.patientName || 'Unknown Patient'}
                                    </Typography>

                                    {/* Chief Complaint */}
                                    {caseRecord.chiefComplaint && (
                                        <Box mb={2}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Chief Complaint:
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {caseRecord.chiefComplaint.length > 100
                                                    ? `${caseRecord.chiefComplaint.substring(0, 100)}...`
                                                    : caseRecord.chiefComplaint}
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Diagnosis */}
                                    {caseRecord.diagnosis && (
                                        <Box mb={2}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Diagnosis:
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {caseRecord.diagnosis.length > 100
                                                    ? `${caseRecord.diagnosis.substring(0, 100)}...`
                                                    : caseRecord.diagnosis}
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Status and Date */}
                                    <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #e0e0e0' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            {caseRecord.status && (
                                                <Chip
                                                    label={caseRecord.status}
                                                    color={getStatusColor(caseRecord.status) as any}
                                                    size="small"
                                                />
                                            )}
                                        </Box>
                                        {caseRecord.visitDate && (
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(caseRecord.visitDate)}
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

        if (paginatedCases.length === 0) {
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
                    <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary">
                        {searchTerm ? 'No case records found' : 'No case records yet'}
                    </Typography>
                    {!searchTerm && (
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
                            Add First Case Record
                        </Button>
                    )}
                </Box>
            )
        }

        return (
            <Box>
                {paginatedCases.map((caseRecord) => {
                    const caseId = caseRecord._id || caseRecord.id || ''
                    return (
                        <Accordion
                            key={caseId}
                            expanded={expandedCase === caseId}
                            onChange={handleAccordionChange(caseId)}
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
                                            bgcolor: 'secondary.main',
                                            width: 40,
                                            height: 40,
                                        }}
                                    >
                                        {getInitials(caseRecord)}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {caseRecord.patientName || 'Unknown Patient'}
                                            </Typography>
                                            {caseRecord.caseNumber && (
                                                <Typography variant="caption" color="text.secondary">
                                                    (#{caseRecord.caseNumber})
                                                </Typography>
                                            )}
                                            {caseRecord.status && (
                                                <Chip
                                                    label={caseRecord.status}
                                                    color={getStatusColor(caseRecord.status) as any}
                                                    size="small"
                                                />
                                            )}
                                        </Box>
                                        {caseRecord.chiefComplaint && (
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {caseRecord.chiefComplaint}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        {caseRecord.visitDate && (
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDate(caseRecord.visitDate)}
                                            </Typography>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleMenuOpen(e, caseId)
                                            }}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    {caseRecord.chiefComplaint && (
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Chief Complaint:
                                            </Typography>
                                            <Typography variant="body2">{caseRecord.chiefComplaint}</Typography>
                                        </Grid>
                                    )}
                                    {caseRecord.diagnosis && (
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Diagnosis:
                                            </Typography>
                                            <Typography variant="body2">{caseRecord.diagnosis}</Typography>
                                        </Grid>
                                    )}
                                    {caseRecord.treatment && (
                                        <Grid size={{ xs: 12 }}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Treatment:
                                            </Typography>
                                            <Typography variant="body2">{caseRecord.treatment}</Typography>
                                        </Grid>
                                    )}
                                    {caseRecord.notes && (
                                        <Grid size={{ xs: 12 }}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Notes:
                                            </Typography>
                                            <Typography variant="body2">{caseRecord.notes}</Typography>
                                        </Grid>
                                    )}
                                    <Grid size={{ xs: 12 }}>
                                        <Box display="flex" gap={2} flexWrap="wrap">
                                            {caseRecord.visitDate && (
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Visit Date:
                                                    </Typography>
                                                    <Typography variant="body2">{formatDate(caseRecord.visitDate)}</Typography>
                                                </Box>
                                            )}
                                            {caseRecord.nextVisitDate && (
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Next Visit:
                                                    </Typography>
                                                    <Typography variant="body2">{formatDate(caseRecord.nextVisitDate)}</Typography>
                                                </Box>
                                            )}
                                            {caseRecord.createdAt && (
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Created:
                                                    </Typography>
                                                    <Typography variant="body2">{formatDateTime(caseRecord.createdAt)}</Typography>
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
                        Case Records
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 0 }}>
                        Manage patient medical case records and treatment history
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
                        placeholder="Search case records..."
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
                            New Case Record
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

                {/* Case Records List/Grid */}
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
                            Showing {paginatedCases.length} of {filteredCases.length} case records
                        </Typography>
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                        {viewMode === 'grid' ? renderGridView() : renderListView()}
                    </Box>

                    {/* Pagination */}
                    {filteredCases.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <TablePagination
                                component="div"
                                count={filteredCases.length}
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
                        const caseRecord = cases.find((c) => (c._id || c.id) === menuCaseId)
                        if (caseRecord) handleEdit(caseRecord)
                    }}
                >
                    <EditIcon sx={{ mr: 1, fontSize: 18 }} />
                    Edit
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (menuCaseId) handleDelete(menuCaseId)
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
                    {selectedCase ? 'Edit Case Record' : 'Add New Case Record'}
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
                                    disabled={!!selectedCase}
                                />
                            </Grid>

                            {/* Case Number */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Case Number"
                                    value={formData.caseNumber || ''}
                                    onChange={(e) => handleFormChange('caseNumber', e.target.value)}
                                    placeholder="Auto-generated if left empty"
                                />
                            </Grid>

                            {/* Status */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={formData.status || 'active'}
                                        label="Status"
                                        onChange={(e) => handleFormChange('status', e.target.value)}
                                    >
                                        <SelectMenuItem value="active">Active</SelectMenuItem>
                                        <SelectMenuItem value="ongoing">Ongoing</SelectMenuItem>
                                        <SelectMenuItem value="completed">Completed</SelectMenuItem>
                                        <SelectMenuItem value="closed">Closed</SelectMenuItem>
                                        <SelectMenuItem value="pending">Pending</SelectMenuItem>
                                        <SelectMenuItem value="cancelled">Cancelled</SelectMenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Visit Date */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Visit Date *"
                                    type="date"
                                    value={formData.visitDate || ''}
                                    onChange={(e) => handleFormChange('visitDate', e.target.value)}
                                    required
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>

                            {/* Next Visit Date */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Next Visit Date"
                                    type="date"
                                    value={formData.nextVisitDate || ''}
                                    onChange={(e) => handleFormChange('nextVisitDate', e.target.value)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>

                            {/* Chief Complaint */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Chief Complaint *"
                                    value={formData.chiefComplaint || ''}
                                    onChange={(e) => handleFormChange('chiefComplaint', e.target.value)}
                                    required
                                    multiline
                                    rows={3}
                                    placeholder="Describe the patient's main complaint..."
                                />
                            </Grid>

                            {/* Diagnosis */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Diagnosis"
                                    value={formData.diagnosis || ''}
                                    onChange={(e) => handleFormChange('diagnosis', e.target.value)}
                                    multiline
                                    rows={3}
                                    placeholder="Enter diagnosis..."
                                />
                            </Grid>

                            {/* Treatment */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Treatment"
                                    value={formData.treatment || ''}
                                    onChange={(e) => handleFormChange('treatment', e.target.value)}
                                    multiline
                                    rows={4}
                                    placeholder="Describe the treatment plan..."
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
                                    placeholder="Any additional notes or observations..."
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

