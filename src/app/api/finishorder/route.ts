import { finishOrder } from "@/app/services/orderService";
import { getCurrentOrderId, setTableFree } from "@/app/services/tableService";
import { NextRequest } from "next/server";


export async function POST(request: NextRequest) {
    try {
        const { tableId } = await request.json();
        console.log('Table ID:', tableId);

        if (!tableId) {
            throw new Error('Invalid table ID');
        }
        const orderId = await getCurrentOrderId(tableId);

        finishOrder(orderId);
        setTableFree(tableId);

        return new Response(JSON.stringify({ message: 'Order finished' }), { status: 200 });

    } catch (error) {
        console.log('Error finishing order:', error);
        return new Response(JSON.stringify({ error: 'Failed to finish order' }), { status: 400 });

    }
}