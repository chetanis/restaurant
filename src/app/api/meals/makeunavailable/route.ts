
import { setMealUnavailable } from "@/app/services/mealService";
import { NextRequest } from "next/server";


export async function POST(request: NextRequest) {
    try {

        const { mealId } = await request.json();
        if (!mealId) {
            return new Response(JSON.stringify({ error: "Missing mealId" }), { status: 400 });
        }
        setMealUnavailable(mealId);
        return new Response(JSON.stringify({ message: 'Meal is now Unavailable' }), { status: 200 });

    } catch (error) {
        console.error('Error making meal available:', error);
        return new Response(JSON.stringify({ error: 'Failed to make meal Unavailable' }), { status: 400 });
    }
}