import React, { useState, useMemo } from 'react';
import { Box, useTheme, SelectChangeEvent } from '@mui/material';
import { TableHeader } from './components/TableHeader';
import { FlightRow } from './components/FlightRow';
import { ExpandedFlightDetails } from './components/ExpandedFlightDetails';
import { TablePagination } from './components/TablePagination';
import { SortField } from './components/TableHeader';

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
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        setExpandedFlightId(null);
    };

    const handleRowsPerPageChange = (event: SelectChangeEvent<number>) => {
        setItemsPerPage(Number(event.target.value));
        setPage(1);
        setExpandedFlightId(null);
    };

    const handleSort = (field: SortField, direction: 'asc' | 'desc') => {
        setSortField(field);
        setSortDirection(direction);
    };

    const sortedFlights = useMemo(() => {
        if (!sortField) return flights;

        return [...flights].sort((a, b) => {
            const multiplier = sortDirection === 'asc' ? 1 : -1;

            switch (sortField) {
                case 'price':
                    return (a.price.raw - b.price.raw) * multiplier;
                case 'stops':
                    return (a.legs[0].stopCount - b.legs[0].stopCount) * multiplier;
                case 'duration':
                    return (a.legs[0].durationInMinutes - b.legs[0].durationInMinutes) * multiplier;
                default:
                    return 0;
            }
        });
    }, [flights, sortField, sortDirection]);

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedFlights = sortedFlights.slice(startIndex, endIndex);
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
                        borderRadius: 2,
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
                    borderRadius: '8px'
                }}
            >
                <TableHeader 
                    isRoundTrip={isRoundTrip} 
                    theme={theme} 
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                />
                <tbody>
                    {displayedFlights.map((flight) => (
                        <React.Fragment key={flight.id}>
                            <FlightRow
                                flight={flight}
                                isExpanded={expandedFlightId === flight.id}
                                isRoundTrip={isRoundTrip}
                                theme={theme}
                                onToggleExpand={toggleExpanded}
                                onSelectOutbound={onSelectOutbound}
                                formatDateTime={formatDateTime}
                            />
                            {expandedFlightId === flight.id && (
                                <ExpandedFlightDetails
                                    flight={flight}
                                    isRoundTrip={isRoundTrip}
                                    theme={theme}
                                    bookingDetails={bookingDetails}
                                    loadingBooking={loadingBooking}
                                    onFetchBookingDetails={fetchBookingDetails}
                                    formatDuration={formatDuration}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </Box>

            {totalPages > 1 && (
                <TablePagination
                    itemsPerPage={itemsPerPage}
                    totalPages={totalPages}
                    page={page}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                />
            )}
        </div>
    );
}