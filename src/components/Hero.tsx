'use client';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import SearchBar from './SearchBar';
import FlightTable from './FlightTable/FlightTable';

interface Flight {
    // ... existing Flight interface
}

const Hero = () => {
    const [searchResults, setSearchResults] = useState<any>(null);
    const [selectedOutboundFlight, setSelectedOutboundFlight] = useState<Flight | null>(null);
    const [isRoundTrip, setIsRoundTrip] = useState(false);
    const [returnFlights, setReturnFlights] = useState<any>(null);

    const handleSearchResults = (results: any, isReturn: boolean = false) => {
        const flightsData = results.data?.itineraries || [];
        if (isReturn) {
            setReturnFlights({ data: flightsData });
        } else {
            setSearchResults({ data: flightsData });
        }
    };

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
        <Box component="section" sx={{ p: 2, border: '1px dashed grey' }}>
            <Typography variant="h2" gutterBottom align='center'>
                Google Flights Clone
            </Typography>
            <SearchBar 
                onSearchResults={handleSearchResults} 
                onTripTypeChange={(isRound) => setIsRoundTrip(isRound)}
            />
            {searchResults && !selectedOutboundFlight && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Select Outbound Flight
                    </Typography>
                    <FlightTable 
                        flights={searchResults.data} 
                        isRoundTrip={isRoundTrip}
                        onSelectOutbound={handleOutboundSelection}
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
                    />
                    <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                        Select Return Flight
                    </Typography>
                    <FlightTable 
                        flights={returnFlights.data} 
                        isRoundTrip={false}
                        isReturnSelection={true}
                    />
                </Box>
            )}
        </Box>
    );
};

export default Hero;
