'use client';
import { useContext } from 'react';
import { AppBar, Toolbar, Tabs, Tab, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4'; 
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ThemeContext } from '../context/ThemeProvider';

const Navbar = () => {
    const themeContext = useContext(ThemeContext);

    if (!themeContext) {
        throw new Error('Theme context must be used within ThemeProvider');
    }

    const { mode, toggleTheme } = themeContext;

    return (
        <AppBar position="sticky" color="transparent" elevation={0}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Tabs value={0} textColor="inherit">
                    <Tab label="Flights" />
                    <Tab label="Hotels" />
                    <Tab label="Car Rentals" />
                </Tabs>
                <IconButton onClick={toggleTheme} color="inherit">
                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
