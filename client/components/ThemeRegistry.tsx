'use client'

import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { theme } from '@/lib/theme'
import { useServerInsertedHTML } from 'next/navigation'
import { useState } from 'react'

/**
 * This ensures that Material-UI styles are loaded first.
 * It allows Material-UI to prepend its styles to the <head>.
 */
function createEmotionCache() {
    return createCache({ key: 'css', prepend: true })
}

/**
 * Client-side theme provider wrapper with Emotion cache
 * This component wraps the Material-UI ThemeProvider and CssBaseline
 * Must be a client component ('use client') because Material-UI requires browser APIs
 * Includes Emotion cache for proper SSR support in Next.js App Router
 */
export function ThemeRegistry({ children }: { children: React.ReactNode }) {
    const [cache] = useState(() => createEmotionCache())

    useServerInsertedHTML(() => {
        return (
            <style
                data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(' ')}`}
                dangerouslySetInnerHTML={{
                    __html: Object.values(cache.inserted).join(' '),
                }}
            />
        )
    })

    return (
        <CacheProvider value={cache}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </CacheProvider>
    )
}

