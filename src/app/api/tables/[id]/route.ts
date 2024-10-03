import * as tableService from '@/app/services/tableService'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { number, numberOfChairs } = await request.json()
        const updatedTable = await tableService.updateTable(Number(params.id), number, numberOfChairs)
        return NextResponse.json(updatedTable, { status: 200 })
    } catch (error) {
        console.log(error);
        
        return NextResponse.json({ error: 'Failed to update table' }, { status: 400 })
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await tableService.deleteTable(Number(params.id))
        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Failed to delete table' }, { status: 400 })
    }
}