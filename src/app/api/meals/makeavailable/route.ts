
import { setMealAvailable } from "@/app/services/mealService";
import { NextRequest } from "next/server";


export async function POST(request: NextRequest) {
    try {

        const { mealId } = await request.json();
        if (!mealId) {
            return new Response(JSON.stringify({ error: "Missing mealId" }), { status: 400 });
        }
        setMealAvailable(mealId);
        return new Response(JSON.stringify({ message: 'Meal is now available' }), { status: 200 });

    } catch (error) {
        console.error('Error making meal available:', error);
        return new Response(JSON.stringify({ error: 'Failed to make meal available' }), { status: 400 });
    }
}