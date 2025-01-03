import { Box, CircularProgress, Theme } from '@mui/material';

interface Carrier {
    id: string;
    logoUrl: string;
    name: string;
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
    };
    destination: {
        name: string;
    };
    durationInMinutes: number;
    carriers: {
        marketing: Carrier[];
    };
    segments: Segment[];
}

interface Flight {
    id: string;
    legs: Leg[];
}

interface BookingAgent {
    name: string;
    url: string;
    price: number;
}

interface BookingDetails {
    [key: string]: BookingAgent[] | null;
}

interface ExpandedFlightDetailsProps {
    flight: Flight;
    isRoundTrip: boolean;
    theme: Theme;
    bookingDetails: BookingDetails;
    loadingBooking: string | null;
    onFetchBookingDetails: (flight: Flight) => void;
    formatDuration: (minutes: number) => string;
}

export const ExpandedFlightDetails = ({
    flight,
    isRoundTrip,
    theme,
    bookingDetails,
    loadingBooking,
    onFetchBookingDetails,
    formatDuration,
}: ExpandedFlightDetailsProps) => (
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
                                    onClick={() => onFetchBookingDetails(flight)}
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
); 