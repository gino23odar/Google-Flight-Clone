import { Box, Theme } from '@mui/material';

interface Carrier {
    id: string;
    name: string;
}

interface Leg {
    departure: string;
    arrival: string;
    stopCount: number;
    carriers: {
        marketing: Carrier[];
    };
}

interface Flight {
    id: string;
    legs: Leg[];
    price: {
        formatted: string;
    };
}

interface FlightRowProps {
    flight: Flight;
    isExpanded: boolean;
    isRoundTrip: boolean;
    theme: Theme;
    onToggleExpand: (flightId: string) => void;
    onSelectOutbound?: (flight: Flight) => void;
    formatDateTime: (date: string) => string;
}

export const FlightRow = ({
    flight,
    isExpanded,
    isRoundTrip,
    theme,
    onToggleExpand,
    onSelectOutbound,
    formatDateTime,
}: FlightRowProps) => {
    const leg = flight.legs[0];

    return (
        <Box
            component="tr"
            sx={{
                cursor: 'pointer',
                bgcolor: isExpanded ? theme.palette.action.selected : 'inherit',
                '&:hover': {
                    bgcolor: theme.palette.action.hover,
                },
            }}
            onClick={() => onToggleExpand(flight.id)}
        >
            <Box
                component="td"
                sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    px: 2,
                    py: 1,
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <span>{formatDateTime(leg.departure)}</span>
                        <span>→</span>
                        <span>{formatDateTime(leg.arrival)}</span>
                    </Box>
                    <Box sx={{
                        typography: 'body2',
                        color: theme.palette.text.secondary,
                    }}>
                        {leg.carriers.marketing.map((carrier, index) => (
                            <span key={carrier.id}>
                                {carrier.name}
                                {index < leg.carriers.marketing.length - 1 ? ', ' : ''}
                            </span>
                        ))}
                    </Box>
                </Box>
            </Box>
            <Box
                component="td"
                sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    px: 2,
                    py: 1,
                }}
            >
                {leg.stopCount} stop(s)
            </Box>
            <Box
                component="td"
                sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    px: 2,
                    py: 1,
                }}
            >
                {flight.price.formatted}
            </Box>
            {isRoundTrip && (
                <Box
                    component="td"
                    sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        px: 2,
                        py: 1,
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelectOutbound?.(flight);
                    }}
                >
                    <Box
                        component="button"
                        sx={{
                            bgcolor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                            border: 'none',
                            cursor: 'pointer',
                            '&:hover': {
                                bgcolor: theme.palette.primary.dark,
                            },
                        }}
                    >
                        Select Flight
                    </Box>
                </Box>
            )}
        </Box>
    );
}; 