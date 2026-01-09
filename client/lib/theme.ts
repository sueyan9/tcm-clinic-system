'use client'

import { createTheme } from '@mui/material/styles'

/**
 * Material-UI theme configuration
 * Defines the color scheme, typography, and component styles for the application
 * Color scheme inspired by modern task management dashboards
 */
export const theme = createTheme({
    palette: {
        primary: {
            main: '#456086', // Blue-gray - for primary actions
            light: '#5a7a9e',
            dark: '#2d4059',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#F8BD8D', // Light orange/peach - for secondary actions
            light: '#fad4b3',
            dark: '#f5a866',
            contrastText: '#000000',
        },
        background: {
            default: '#FBF7F4', // Off-white/light gray - main background
            paper: '#FFFFFF', // White for cards and papers
        },
        text: {
            primary: '#000000', // Black for primary text
            secondary: '#456086', // Blue-gray for secondary text
        },
        grey: {
            50: '#FBF7F4', // Off-white/light gray
            100: '#FBF7F4', // Sidebar background
            200: '#F0E9E6', // Light beige/gray - borders
            300: '#F0E9E6',
            400: '#F0E9E6',
            500: '#F0E9E6', // Secondary text
            600: '#99908d',
            700: '#456086', // Selected item background
            800: '#2d4059', // Dark text
            900: '#000000',
        },
        info: {
            main: '#456086', // Blue-gray
            light: '#5a7a9e',
            dark: '#2d4059',
        },
        // accent: {
        //     purple: '#844685', // Purple accent color
        //     peach: '#F8BD8D', // Light orange/peach
        // },
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
    },
    components: {
        // Customize Material-UI components globally
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none', // Don't uppercase button text
                    borderRadius: 8,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                },
            },
        },
    },
})

