import * as tableService from '@/app/services/tableService';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const tables = await tableService.getTables()
        return NextResponse.json(tables, { status: 200 })
    } catch (error) {
        console.log('Error fetching tables:', error);
        
        return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { number, numberOfChairs } = await request.json()
        const newTable = await tableService.createTable(number, numberOfChairs)
        return NextResponse.json(newTable, { status: 201 })
    } catch (error) {
        console.log('error creating table:', error);
        
        return NextResponse.json({ error: 'Failed to create table' }, { status: 400 })
    }
}