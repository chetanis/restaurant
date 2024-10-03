import * as mealService from '@/app/services/mealService';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { name, price, categoryId, description } = await request.json()
        const newMeal = await mealService.createMeal(name, price, categoryId, description)
        return new Response(JSON.stringify(newMeal), { status: 201 })
    } catch (error) {
        console.log('error creating meal:', error);
        
        return new Response(JSON.stringify({ error: 'Failed to create meal' }), { status: 400 })
    }
}