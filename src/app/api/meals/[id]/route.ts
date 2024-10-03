import * as mealService from '@/app/services/mealService';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { name, price, categoryId, description } = await request.json();
        const updatedMeal = await mealService.updateMeal(Number(params.id), name, price, categoryId, description);
        return new Response(JSON.stringify(updatedMeal), { status: 201 });
    } catch (error) {
        console.log('error updating meal:', error);

        return new Response(JSON.stringify({ error: 'Failed to update meal' }), { status: 400 })
    }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const meals = await mealService.getMeal(Number(params.id));
        return new Response(JSON.stringify(meals), { status: 200 });
    } catch (error) {
        console.log('Error fetching meal:', error);

        return new Response(JSON.stringify({ error: 'Failed to fetch meal' }), { status: 500 });
    }
}