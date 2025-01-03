import { Box, Theme } from '@mui/material';

interface TableHeaderProps {
    isRoundTrip: boolean;
    theme: Theme;
}

export const TableHeader = ({ isRoundTrip, theme }: TableHeaderProps) => (
    <thead>
        <tr>
            {['Flight Details', 'Stops', 'Price', ...(isRoundTrip ? ['Action'] : [])].map((header) => (
                <Box
                    key={header}
                    component="th"
                    sx={{
                        bgcolor: theme.palette.action.hover,
                        border: `1px solid ${theme.palette.divider}`,
                        px: 2,
                        py: 1,
                    }}
                >
                    {header}
                </Box>
            ))}
        </tr>
    </thead>
); 