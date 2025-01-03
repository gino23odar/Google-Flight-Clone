'use client';

import React, { createContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

interface ThemeContextType {
    mode: 'light' | 'dark';
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<'light' | 'dark'>('light');

    const toggleTheme = () => setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));

    const theme = createTheme({
        palette: {
            mode,
            background: {
                default: mode === 'light' ? '#ffffff' : '#202124',
                paper: mode === 'light' ? '#ffffff' : '#303134',
            },
            text: {
                primary: mode === 'light' ? '#171717' : '#ededed',
            },
        },
    });

    // Sync with CSS
    useEffect(() => {
        document.documentElement.style.setProperty(
            '--background',
            theme.palette.background.default
        );
        document.documentElement.style.setProperty(
            '--foreground',
            theme.palette.text.primary
        );
    }, [mode, theme.palette.background.default, theme.palette.text.primary]);

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <MuiThemeProvider theme={theme}>
                <div style={{ background: theme.palette.background.default, minHeight: '100vh' }}>
                    {children}
                </div>
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}
