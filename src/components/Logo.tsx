import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeProvider';
import { Box } from '@mui/material';

const Logo = () => {
    const themeContext = useContext(ThemeContext);
    
    if (!themeContext) {
        throw new Error('Theme context must be used within ThemeProvider');
    }

    const { mode } = themeContext;

    return (
        <Box 
            sx={{
                width: '100%',
                overflow: 'hidden',
                mb: 2
            }}
        >
            <Box 
                component="img"
                src={mode === 'dark' ? '/flights_nc_dark_theme_4.svg' : '/flights_nc_4.svg'}
                alt="Google Flights Logo"
                sx={{
                    width: '800px',
                    maxWidth: 'none',
                    height: 'auto',
                    display: 'block',
                    mx: 'auto',
                    '@media (max-width: 520px)': {
                        transform: 'translateX(-50%)',
                        position: 'relative',
                        left: '50%'
                    }
                }}
            />
        </Box>
    );
};

export default Logo; 