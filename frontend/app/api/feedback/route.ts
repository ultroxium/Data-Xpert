import axios, { AxiosError } from 'axios';
import { NextResponse } from 'next/server';

export interface Feedback {
    name: string;
    email: string;
    message: string;
}

// Helper function to post feedback
async function postFeedback(feedback: Feedback) {
    return axios.post(`${process.env.NEXT_PUBLIC_API_URL}/feedback/`, feedback, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function POST(req: Request) {
    try {
        // Parse the request body
        const feedback: Feedback = await req.json();

        // Validate the request body
        if (!feedback.name || !feedback.email || !feedback.message) {
            return NextResponse.json(
                { message: 'Missing required fields: name, email, or message' },
                { status: 400 }
            );
        }

        // Post feedback to the backend
        const response = await postFeedback(feedback);

        // Return the response from the backend
        return NextResponse.json({
            data: response.data,
        });
    } catch (error) {
        console.error('Error posting feedback:', error);

        // Handle Axios errors
        if (error instanceof AxiosError) {
            return NextResponse.json(
                { message: `Error posting feedback: ${error.message}` },
                { status: error.response?.status || 500 }
            );
        }

        // Handle other errors
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}