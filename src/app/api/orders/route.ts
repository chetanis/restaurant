import * as orderService from "@/app/services/orderService";
import { getCurrentOrderId, isTableFree, setTableOccupied } from "@/app/services/tableService";
import { isOrderInput } from "@/app/types/orders";
import { NextRequest } from "next/server";


export async function POST(request: NextRequest) {
    try {
        const input = await request.json();
        // check if input is a valid order input
        if (!isOrderInput(input)) {
            throw new Error('Invalid order input');
        }
        
        let order
        // table free = create order
        if (await isTableFree(input.tableId)) {

            order = await orderService.createOrder(input);
            setTableOccupied(input.tableId, order.id);
            orderService.printKitchenTicket(order.id);
            
        } else {
            // table not free we create an order update
            const currentOrderId = await getCurrentOrderId(input.tableId);
            order = await orderService.updateOrder(input, currentOrderId);
            orderService.printKitchenTicket(order.orderId,order.id);
        }

        return new Response(JSON.stringify(order), { status: 201 });
    } catch (error) {
        console.log('Error creating order:', error);
        return new Response(JSON.stringify({ error: 'Failed to create order' }), { status: 400 });
    }
}

