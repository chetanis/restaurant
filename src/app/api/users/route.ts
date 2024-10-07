
import { createUser } from '@/app/services/userService';
import { CreateUserInput } from '@/app/types/user';
import { NextRequest, NextResponse } from 'next/server';



export async function POST(request: NextRequest) {
    try {
        const body: CreateUserInput = await request.json();

        await createUser(body);

        return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
        
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}