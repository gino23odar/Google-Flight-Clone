import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const API_KEY = process.env.RAPIDAPI_KEY!;
    const searchParams = await request.json();

    const queryString = new URLSearchParams({
        originSkyId: searchParams.originSkyId,
        destinationSkyId: searchParams.destinationSkyId,
        originEntityId: searchParams.originEntityId,
        destinationEntityId: searchParams.destinationEntityId,
        date: searchParams.date,
        ...(searchParams.returnDate && { returnDate: searchParams.returnDate }),
        cabinClass: searchParams.cabinClass || 'economy',
        adults: String(searchParams.adults || 1),
        sortBy: 'price_high',
        currency: 'USD',
        market: 'en-US',
        countryCode: 'US'
    }).toString();

    const url = `https://sky-scrapper.p.rapidapi.com/api/v2/flights/searchFlightsComplete?${queryString}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com'
            },
        });

        if (!response.ok) throw new Error('Failed to fetch flights data');

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        } else {
            return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
        }
    }
}
