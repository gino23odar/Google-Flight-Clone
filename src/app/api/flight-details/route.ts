import { NextRequest, NextResponse } from 'next/server';

interface Leg {
    origin: string;
    destination: string;
    date: string;
}

export async function POST(request: NextRequest) {
    const API_KEY = process.env.RAPIDAPI_KEY!;
    const { itineraryId, legs, sessionId, adults = 1, children = 0, infants = 0 } = await request.json();

    // make legs a string
    const formattedLegs = JSON.stringify(legs);

    const queryParams = new URLSearchParams({
        itineraryId: itineraryId,
        legs: formattedLegs,
        sessionId: sessionId,
        adults: String(adults),
        children: String(children),
        infants: String(infants),
        currency: 'USD',
        locale: 'en-US',
        market: 'en-US',
        countryCode: 'US'
    }).toString();

    const url = `https://sky-scrapper.p.rapidapi.com/api/v1/flights/getFlightDetails?${queryParams}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com'
            },
        });

        if (!response.ok) throw new Error('Failed to fetch flight details');

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}