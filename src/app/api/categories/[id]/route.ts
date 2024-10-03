import * as categoryService from '@/app/services/categoryService';
import { NextResponse } from 'next/server';

export async function GET(request: Request, {params}: {params: {id: string}}) {
    try {
        const category = await categoryService.getCategory(Number(params.id));
        return NextResponse.json(category,{status:200})
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Failed to load category' }, { status: 400 })
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { name } = await request.json()
        const updatedCategory = await categoryService.updateCategory(Number(params.id), name)
        return NextResponse.json(updatedCategory, { status: 200 })
    } catch (error) {
        console.log(error);
        
        return NextResponse.json({ error: 'Failed to update category' }, { status: 400 })
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await categoryService.deleteCategory(Number(params.id))
        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 400 })
    }
}
