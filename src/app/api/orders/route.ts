import * as orderService from "@/app/services/orderService";
import { CreateOrderInput, UpdateOrderInput } from "@/app/types/orders";
import { NextRequest } from "next/server";


export async function POST(request: NextRequest) {
    try {
        const input = await request.json();
        const order = await orderService.createOrUpdateOrder(input as CreateOrderInput | UpdateOrderInput);
        return new Response(JSON.stringify(order), { status: 201 });
    } catch (error) {
        console.log('Error creating order:', error);
        return new Response(JSON.stringify({ error: 'Failed to create order' }), { status: 400 });
    }
}

