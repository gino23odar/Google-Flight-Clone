'use client';
import { useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import SearchBar from './SearchBar';
import FlightTable from './FlightTable/FlightTable';
import Logo from './Logo';

interface Flight {
    // ... existing Flight interface
}

const Hero = () => {
    const [searchResults, setSearchResults] = useState<any>(null);
    const [selectedOutboundFlight, setSelectedOutboundFlight] = useState<Flight | null>(null);
    const [isRoundTrip, setIsRoundTrip] = useState(false);
    const [returnFlights, setReturnFlights] = useState<any>(null);
    const [sessionId, setSessionId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passengerCounts, setPassengerCounts] = useState({
        adults: 1,
        children: 0,
        infants: 0
    });

    const handleSearchResults = (results: any, isReturn: boolean = false) => {
        setIsLoading(false);
        const flightsData = results.data?.itineraries || [];
        console.log({data: flightsData})
        console.log('full data: ', results.data.context.sessionId);

        if (isReturn) {
            setReturnFlights({ data: flightsData });
        } else {
            setSearchResults({ data: flightsData });
            setSessionId(results.data.context.sessionId);
        }
    };

    // not working currently since I decided to just get the round trips directly.
    const handleOutboundSelection = async (flight: Flight) => {
        setSelectedOutboundFlight(flight);
        
        // API call for return flights
        try {
            const response = await fetch('/api/flights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // Swap origin and destination for return flight
                    originSkyId: flight.legs[0].destination.skyId,
                    destinationSkyId: flight.legs[0].origin.skyId,
                    //other necessary parameters?
                    date: returnDate, // from SearchBar
                }),
            });

            if (!response.ok) throw new Error('Failed to fetch return flights');

            const data = await response.json();
            handleSearchResults(data, true);
        } catch (error) {
            console.error('Error fetching return flights:', error);
        }
    };

    return (
        <Box component="section" sx={{ pb: 1, border: '1px dashed grey', width: '100%', maxWidth: '1200px', mx: 'auto' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4, width: '100%' }}>
                <Box sx={{ 
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0
                }}>
                    <Logo />
                    <Typography 
                        variant="h2" 
                        align='center'
                        sx={{
                            fontSize: '3.75rem',
                            lineHeight: 1.2
                        }}
                    >
                        Google Flights Clone
                    </Typography>
                </Box>
            </Box>
            <SearchBar 
                onSearchResults={handleSearchResults} 
                onTripTypeChange={(isRound) => setIsRoundTrip(isRound)}
                setSessionId={setSessionId}
                setIsLoading={setIsLoading}
                onPassengerCountsChange={setPassengerCounts}
            />
            {isLoading ? (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '200px' 
                }}>
                    <CircularProgress size={60} />
                </Box>
            ) : (
                <>
                    {searchResults && !selectedOutboundFlight && (
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h5" gutterBottom>
                                Select Outbound Flight
                            </Typography>
                            <FlightTable 
                                flights={searchResults.data} 
                                isRoundTrip={isRoundTrip}
                                onSelectOutbound={handleOutboundSelection}
                                sessionId={sessionId}
                                passengerCounts={passengerCounts}
                            />
                        </Box>
                    )}
                    {selectedOutboundFlight && returnFlights && (
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h5" gutterBottom>
                                Selected Outbound Flight
                            </Typography>
                            <FlightTable 
                                flights={[selectedOutboundFlight]} 
                                isRoundTrip={false}
                                sessionId={sessionId}
                            />
                            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                                Select Return Flight
                            </Typography>
                            <FlightTable 
                                flights={returnFlights.data} 
                                isRoundTrip={false}
                                isReturnSelection={true}
                                sessionId={sessionId}
                                passengerCounts={passengerCounts}
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};
export default Hero;
