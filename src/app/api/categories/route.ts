import * as categoryService from '@/app/services/categoryService';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const tables = await categoryService.getCategories()
        return NextResponse.json(tables, { status: 200 })
    } catch (error) {
        console.log('Error fetching categories:', error);
        
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { name } = await request.json()
        const newTable = await categoryService.createCategory(name)
        return NextResponse.json(newTable, { status: 201 })
    } catch (error) {
        console.log('error creating category:', error);
        
        return NextResponse.json({ error: 'Failed to create category' }, { status: 400 })
    }
}