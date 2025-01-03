import React, { useState } from 'react';
import { Pagination, Box, Select, MenuItem, FormControl, InputLabel, useTheme, CircularProgress, SelectChangeEvent } from '@mui/material';

interface Carrier {
    id: string;
    alternateId: string;
    logoUrl: string;
    name: string;
    operationType: string;
}

interface Segment {
    id: string;
    origin: {
        parent: {
            name: string;
            country: string;
        };
    };
    destination: {
        parent: {
            name: string;
            country: string;
        };
    };
    departure: string;
    arrival: string;
    durationInMinutes: number;
    flightNumber: string;
}

interface Leg {
    id: string;
    origin: {
        name: string;
        id?: string;
    };
    destination: {
        name: string;
        id?: string;
    };
    durationInMinutes: number;
    stopCount: number;
    departure: string;
    arrival: string;
    carriers: {
        marketing: Carrier[];
    };
    segments: Segment[];
}

interface Flight {
    id: string;
    price: {
        raw: number;
        formatted: string;
    };
    legs: Leg[];
    itineraryId: string;
    sessionId: string;
}

interface FlightTableProps {
    flights: Flight[];
    isRoundTrip?: boolean;
    onSelectOutbound?: (flight: Flight) => void;
    isReturnSelection?: boolean;
    sessionId: string;
    passengerCounts: {
        adults: number;
        children: number;
        infants: number;
    };
}

interface BookingAgent {
    name: string;
    url: string;
    price: number;
}

interface BookingDetails {
    [key: string]: BookingAgent[] | null;
}

export default function FlightTable({
    flights,
    isRoundTrip = false,
    onSelectOutbound,
    isReturnSelection = false,
    sessionId,
    passengerCounts
}: FlightTableProps) {
    const theme = useTheme();
    const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [bookingDetails, setBookingDetails] = useState<BookingDetails>({});
    const [loadingBooking, setLoadingBooking] = useState<string | null>(null);

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        setExpandedFlightId(null);
    };

    const handleRowsPerPageChange = (event: SelectChangeEvent<number>) => {
        setItemsPerPage(Number(event.target.value));
        setPage(1);
        setExpandedFlightId(null);
    };

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedFlights = flights.slice(startIndex, endIndex);
    const totalPages = Math.ceil(flights.length / itemsPerPage);

    const toggleExpanded = (flightId: string) => {
        setExpandedFlightId(expandedFlightId === flightId ? null : flightId);
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const fetchBookingDetails = async (flight: Flight) => {
        if (bookingDetails[flight.id]) return;

        let itinId = flight.id.split('|')[0];

        // console.log('legs: ', flight.legs);

        // Format legs data
        const legs = flight.legs.map(leg => ({
            origin: leg.origin.id,
            destination: leg.destination.id,
            date: new Date(leg.departure).toISOString().split('T')[0]
        }));

        setLoadingBooking(flight.id);
        try {
            const response = await fetch('/api/flight-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itineraryId: itinId,
                    legs: legs,
                    sessionId: sessionId,
                    adults: passengerCounts.adults,
                    children: passengerCounts.children,
                    infants: passengerCounts.infants
                }),
            });

            // console.log('itinId: ', itinId);
            // console.log('session: ', sessionId);

            if (!response.ok) throw new Error('Failed to fetch booking details');

            const data = await response.json();
            console.log('Booking details response:', data);

            const agents = data.data?.itinerary?.pricingOptions?.[0]?.agents || [];
            console.log('Extracted agents:', agents);

            setBookingDetails(prev => ({
                ...prev,
                [flight.id]: agents.map((agent: any) => ({
                    name: agent.name,
                    url: agent.url,
                    price: agent.price,
                })),
            }));
        } catch (error) {
            console.error('Error fetching booking details:', error);
        } finally {
            setLoadingBooking(null);
        }
    };

    return (
        <div>
            {isReturnSelection && (
                <Box
                    sx={{
                        mb: 4,
                        p: 4,
                        bgcolor: theme.palette.primary.light,
                        borderRadius: 1,
                    }}
                >
                    <h2 className="text-lg font-semibold">Select your return flight</h2>
                </Box>
            )}
            <Box
                component="table"
                sx={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: `1px solid ${theme.palette.divider}`,
                }}
            >
                <thead>
                    <tr>
                        <Box
                            component="th"
                            sx={{
                                bgcolor: theme.palette.action.hover,
                                border: `1px solid ${theme.palette.divider}`,
                                px: 2,
                                py: 1,
                            }}
                        >
                            Flight Details
                        </Box>
                        <Box
                            component="th"
                            sx={{
                                bgcolor: theme.palette.action.hover,
                                border: `1px solid ${theme.palette.divider}`,
                                px: 2,
                                py: 1,
                            }}
                        >
                            Stops
                        </Box>
                        <Box
                            component="th"
                            sx={{
                                bgcolor: theme.palette.action.hover,
                                border: `1px solid ${theme.palette.divider}`,
                                px: 2,
                                py: 1,
                            }}
                        >
                            Price
                        </Box>
                        {isRoundTrip && (
                            <Box
                                component="th"
                                sx={{
                                    bgcolor: theme.palette.action.hover,
                                    border: `1px solid ${theme.palette.divider}`,
                                    px: 2,
                                    py: 1,
                                }}
                            >
                                Action
                            </Box>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {displayedFlights.map((flight) => {
                        const isExpanded = expandedFlightId === flight.id;
                        const leg = flight.legs[0];

                        // console.log('Flight data:', flight);

                        return (
                            <React.Fragment key={flight.id}>
                                <Box
                                    component="tr"
                                    sx={{
                                        cursor: 'pointer',
                                        bgcolor: isExpanded ? theme.palette.action.selected : 'inherit',
                                        '&:hover': {
                                            bgcolor: theme.palette.action.hover,
                                        },
                                    }}
                                    onClick={() => toggleExpanded(flight.id)}
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

                                {isExpanded && (
                                    <Box
                                        component="tr"
                                        sx={{
                                            bgcolor: theme.palette.action.hover,
                                        }}
                                    >
                                        <Box
                                            component="td"
                                            colSpan={isRoundTrip ? 4 : 3}
                                            sx={{
                                                border: `1px solid ${theme.palette.divider}`,
                                                px: 2,
                                                py: 1,
                                            }}
                                        >
                                            <div>
                                                {flight.legs.map((leg, index) => (
                                                    <div
                                                        key={index}
                                                        className="mb-4 last:mb-0 border-b last:border-0 pb-4 last:pb-0"
                                                    >
                                                        <div className="mb-4">
                                                            <strong>
                                                                {leg.origin.name} → {leg.destination.name}
                                                            </strong>
                                                        </div>

                                                        {/* Segments Information */}
                                                        <div className="pl-4 space-y-4">
                                                            {leg.segments.map((segment, segIndex) => (
                                                                <div key={segment.id} className="border-l-2 border-gray-300 pl-4">
                                                                    <div className="font-medium">
                                                                        Segment {segIndex + 1}: {segment.origin.parent.name}, {segment.origin.parent.country} → {' '}
                                                                        {segment.destination.parent.name}, {segment.destination.parent.country}
                                                                    </div>
                                                                    <div>Flight: {segment.flightNumber}</div>
                                                                    <div>Departure: {new Date(segment.departure).toLocaleString()}</div>
                                                                    <div>Arrival: {new Date(segment.arrival).toLocaleString()}</div>
                                                                    <div>Duration: {formatDuration(segment.durationInMinutes)}</div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="mt-4">
                                                            <div>Total Duration: {formatDuration(leg.durationInMinutes)}</div>
                                                            <div>
                                                                Carrier(s):
                                                                <ul className="mt-2 space-y-2">
                                                                    {leg.carriers.marketing.map((carrier) => (
                                                                        <li
                                                                            key={carrier.id}
                                                                            className="flex items-center space-x-2"
                                                                        >
                                                                            {carrier.logoUrl && (
                                                                                <img
                                                                                    src={carrier.logoUrl}
                                                                                    alt={carrier.name}
                                                                                    className="w-6 h-6"
                                                                                />
                                                                            )}
                                                                            <span>{carrier.name}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4">
                                                            <div className="font-medium mb-2">Booking Options:</div>
                                                            {loadingBooking === flight.id ? (
                                                                <div className="flex justify-center">
                                                                    <CircularProgress size={24} />
                                                                </div>
                                                            ) : bookingDetails[flight.id] ? (
                                                                <div className="space-y-2">
                                                                    {bookingDetails[flight.id]?.map((agent, index) => (
                                                                        <a
                                                                            key={index}
                                                                            href={agent.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-block"
                                                                        >
                                                                            <Box
                                                                                component="button"
                                                                                sx={{
                                                                                    bgcolor: theme.palette.success.main,
                                                                                    color: theme.palette.success.contrastText,
                                                                                    px: 2,
                                                                                    py: 1,
                                                                                    borderRadius: 1,
                                                                                    border: 'none',
                                                                                    cursor: 'pointer',
                                                                                    '&:hover': {
                                                                                        bgcolor: theme.palette.success.dark,
                                                                                    },
                                                                                }}
                                                                            >
                                                                                Book with {agent.name} (${agent.price})
                                                                            </Box>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <Box
                                                                    component="button"
                                                                    onClick={() => fetchBookingDetails(flight)}
                                                                    sx={{
                                                                        bgcolor: theme.palette.info.main,
                                                                        color: theme.palette.info.contrastText,
                                                                        px: 2,
                                                                        py: 1,
                                                                        borderRadius: 1,
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        '&:hover': {
                                                                            bgcolor: theme.palette.info.dark,
                                                                        },
                                                                    }}
                                                                >
                                                                    Show Booking Options
                                                                </Box>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Box>
                                    </Box>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </Box>

            {totalPages > 1 && (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 3,
                    p: 2.5
                }}>
                    <FormControl size="small">
                        <InputLabel id="rows-per-page-label">Rows</InputLabel>
                        <Select
                            labelId="rows-per-page-label"
                            value={itemsPerPage}
                            label="Rows"
                            onChange={handleRowsPerPageChange}
                            sx={{ minWidth: 80 }}
                        >
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={15}>15</MenuItem>
                            <MenuItem value={25}>25</MenuItem>
                        </Select>
                    </FormControl>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}
        </div>
    );
}