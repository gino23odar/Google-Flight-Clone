'use client';
import { useState } from 'react';
import {
    Box,
    Button,
    Select,
    MenuItem,
    SelectChangeEvent,
    CircularProgress,
    Autocomplete,
    TextField,
    Typography,
    IconButton,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';

type AirportOption = {
    label: string;
    skyId: string;
    entityId: string;
    type: string;
};

type PassengerCounts = {
    adults: number;
    children: number;
    infants: number;
};

type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

interface SearchBarProps {
    onSearchResults: (results: any) => void;
    onTripTypeChange: (isRoundTrip: boolean) => void;
    setSessionId: (id: string) => void;
    setIsLoading: (loading: boolean) => void;
    onPassengerCountsChange: (counts: PassengerCounts) => void;
}

const SearchBar = ({ onSearchResults, onTripTypeChange, setSessionId, setIsLoading, onPassengerCountsChange }: SearchBarProps) => {
    const [tripType, setTripType] = useState<string>('Round trip');
    const [departureDate, setDepartureDate] = useState<Dayjs | null>(dayjs());
    const [returnDate, setReturnDate] = useState<Dayjs | null>(dayjs().add(1, 'day'));
    const [fromOptions, setFromOptions] = useState<AirportOption[]>([]);
    const [toOptions, setToOptions] = useState<AirportOption[]>([]);
    const [selectedFrom, setSelectedFrom] = useState<AirportOption | null>(null);
    const [selectedTo, setSelectedTo] = useState<AirportOption | null>(null);
    const [isLoadingFrom, setIsLoadingFrom] = useState(false);
    const [isLoadingTo, setIsLoadingTo] = useState(false);
    const [passengerCounts, setPassengerCounts] = useState<PassengerCounts>({
        adults: 1,
        children: 0,
        infants: 0,
    });
    const [cabinClass, setCabinClass] = useState<CabinClass>('economy');
    const [isPassengerMenuOpen, setIsPassengerMenuOpen] = useState(false);

    const handleTripTypeChange = (event: SelectChangeEvent) => {
        const isRoundTrip = event.target.value === 'Round trip';
        setTripType(event.target.value);
        onTripTypeChange(isRoundTrip);
    };

    const fetchAirports = async (query: string): Promise<AirportOption[]> => {
        const url = `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${query}&locale=en-US`;
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': 'b9d9ed4be2msh3c1601c051d6680p1a0d22jsn5f34b8c5ae18',
                'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com',
            },
        };
        console.log("Query:", query);

        try {
            const response = await fetch(url, options);
            const result = await response.json();

            setSessionId(result.sessionId);


            console.log("Result:", result);
            console.log("Result:", result.sessionId);

            // Safeguard unexpected return from API
            if (!result.data || !Array.isArray(result.data)) {
                console.error('Unexpected API response format:', result);
                return [];
            }

            console.log("Before Filtering:", result.data);

            const filteredData = result.data.filter(
                (item: any) =>
                    item.presentation?.suggestionTitle &&
                    item.navigation?.relevantFlightParams?.skyId
            );

            // console.log("After Filtering:", filteredData);

            return filteredData.map((item: any) => ({
                label: item.presentation.suggestionTitle,
                skyId: item.navigation.relevantFlightParams.skyId,
                entityId: item.navigation.relevantFlightParams.entityId,
                type: item.navigation.relevantFlightParams.flightPlaceType,
            }));
        } catch (error) {
            console.error('Error fetching airports:', error);
            return [];
        }
    };

    const handleFromInputChange = async (
        _: React.SyntheticEvent,
        value: string
    ) => {
        if (value.length < 3) return;
        setIsLoadingFrom(true);
        const options = await fetchAirports(value);
        setFromOptions(options);
        console.log("From Options:", options);
        setIsLoadingFrom(false);
    };

    const handleToInputChange = async (
        _: React.SyntheticEvent,
        value: string
    ) => {
        if (value.length < 3) return;
        setIsLoadingTo(true);
        const options = await fetchAirports(value);
        setToOptions(options);
        setIsLoadingTo(false);
    };

    const handleSearch = async () => {
        if (!selectedFrom || !selectedTo || !departureDate) {
            alert('Please fill in all required fields');
            return;
        }

        setIsLoading(true);

        const searchParams = {
            originSkyId: selectedFrom.skyId,
            destinationSkyId: selectedTo.skyId,
            originEntityId: selectedFrom.entityId,
            destinationEntityId: selectedTo.entityId,
            date: departureDate.format('YYYY-MM-DD'),
            returnDate: tripType === 'Round trip' && returnDate ? returnDate.format('YYYY-MM-DD') : undefined,
            // Only include if different from default
            ...(cabinClass !== 'economy' && { cabinClass }),
            ...(passengerCounts.adults !== 1 && { adults: passengerCounts.adults }),
            ...(passengerCounts.children > 0 && { children: passengerCounts.children }),
            ...(passengerCounts.infants > 0 && { infants: passengerCounts.infants }),
            sortBy: 'price_high',
            currency: 'USD',
            market: 'en-US',
            countryCode: 'US'
        };

        try {
            const response = await fetch('/api/flights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(searchParams),
            });

            if (!response.ok) throw new Error('Failed to fetch flights');

            const data = await response.json();
            onSearchResults(data);
        } catch (error) {
            console.error('Error searching flights:', error);
            alert('Failed to search flights. Please try again.');
            setIsLoading(false);
        }
    };

    const handlePassengerChange = (type: keyof PassengerCounts, increment: boolean) => {
        setPassengerCounts(prev => {
            const newCount = increment ? prev[type] + 1 : prev[type] - 1;

            // Validation
            if (newCount < 0) return prev;
            if (type === 'adults' && newCount === 0) return prev;
            if (type === 'infants' && newCount > prev.adults) return prev;
            if ((prev.adults + prev.children + prev.infants) >= 9 && increment) return prev;

            const newCounts = {
                ...prev,
                [type]: newCount
            };
            
            onPassengerCountsChange(newCounts);
            return newCounts;
        });
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box

                display="flex"
                flexWrap='wrap'
                justifyContent="center"
                alignItems="center"
                gap={2}
                padding={2}
                sx={{
                    backgroundColor: 'background.paper', borderRadius: '8px', boxShadow: 3, '@media (max-width: 600px)': {
                        flexDirection: 'column',
                        gap: 1.5,
                    },
                }}
            >
                {/*Field for Trip Type */}
                <Select
                    value={tripType}
                    onChange={handleTripTypeChange}
                    variant="outlined"
                    size="small"
                >
                    <MenuItem value="Round trip">Round trip</MenuItem>
                    <MenuItem value="One way">One way</MenuItem>
                </Select>

                {/* From */}
                <Autocomplete
                    options={fromOptions}
                    getOptionLabel={(option) => option.label}
                    onInputChange={handleFromInputChange}
                    onChange={(_, newValue) => setSelectedFrom(newValue)}
                    value={selectedFrom}
                    isOptionEqualToValue={(option, value) => option.skyId === value.skyId}
                    sx={{ minWidth: 250 }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="From"
                            variant="outlined"
                            size="small"
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {isLoadingFrom ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />

                {/* To */}
                <Autocomplete
                    options={toOptions}
                    getOptionLabel={(option) => option.label}
                    onInputChange={handleToInputChange}
                    onChange={(_, newValue) => setSelectedTo(newValue)}
                    value={selectedTo}
                    isOptionEqualToValue={(option, value) => option.skyId === value.skyId}
                    sx={{ minWidth: 250 }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="To"
                            variant="outlined"
                            size="small"
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {isLoadingTo ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />

                {/* Date */}
                <DatePicker
                    label="Departure"
                    value={departureDate}
                    onChange={(newDate) => setDepartureDate(newDate)}
                    slotProps={{
                        textField: { size: 'small' },
                    }}
                />
                {tripType === 'Round trip' && (
                    <DatePicker
                        label="Return"
                        value={returnDate}
                        onChange={(newDate) => setReturnDate(newDate)}
                        slotProps={{
                            textField: { size: 'small' },
                        }}
                    />
                )}

                {/* Passenger */}
                <Box sx={{ position: 'relative' }}>
                    <Button
                        onClick={() => setIsPassengerMenuOpen(!isPassengerMenuOpen)}
                        variant="outlined"
                        size="small"
                    >
                        {passengerCounts.adults + passengerCounts.children + passengerCounts.infants} Passenger(s)
                    </Button>
                    {isPassengerMenuOpen && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                zIndex: 1000,
                                width: 300,
                                bgcolor: 'background.paper',
                                boxShadow: 3,
                                borderRadius: 1,
                                p: 2,
                            }}
                        >
                            {/* Adults */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box>
                                    <Typography variant="subtitle1">Adults</Typography>
                                    <Typography variant="caption" color="text.secondary">Age 12+</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => handlePassengerChange('adults', false)}
                                        disabled={passengerCounts.adults <= 1}
                                    >
                                        <RemoveCircleOutline />
                                    </IconButton>
                                    <Typography>{passengerCounts.adults}</Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => handlePassengerChange('adults', true)}
                                        disabled={passengerCounts.adults + passengerCounts.children + passengerCounts.infants >= 9}
                                    >
                                        <AddCircleOutline />
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* Children */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box>
                                    <Typography variant="subtitle1">Children</Typography>
                                    <Typography variant="caption" color="text.secondary">Age 2-11</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => handlePassengerChange('children', false)}
                                        disabled={passengerCounts.children <= 0}
                                    >
                                        <RemoveCircleOutline />
                                    </IconButton>
                                    <Typography>{passengerCounts.children}</Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => handlePassengerChange('children', true)}
                                        disabled={passengerCounts.adults + passengerCounts.children + passengerCounts.infants >= 9}
                                    >
                                        <AddCircleOutline />
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* Infants */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="subtitle1">Infants</Typography>
                                    <Typography variant="caption" color="text.secondary">Under 2</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => handlePassengerChange('infants', false)}
                                        disabled={passengerCounts.infants <= 0}
                                    >
                                        <RemoveCircleOutline />
                                    </IconButton>
                                    <Typography>{passengerCounts.infants}</Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => handlePassengerChange('infants', true)}
                                        disabled={passengerCounts.infants >= passengerCounts.adults}
                                    >
                                        <AddCircleOutline />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* Cabin Class */}
                <Select
                    value={cabinClass}
                    onChange={(e) => setCabinClass(e.target.value as CabinClass)}
                    size="small"
                >
                    <MenuItem value="economy">Economy</MenuItem>
                    <MenuItem value="premium_economy">Premium Economy</MenuItem>
                    <MenuItem value="business">Business</MenuItem>
                    <MenuItem value="first">First</MenuItem>
                </Select>

                <Button variant="contained" color="primary" onClick={handleSearch}>
                    Explore
                </Button>
            </Box>
        </LocalizationProvider>
    );
};

export default SearchBar;

