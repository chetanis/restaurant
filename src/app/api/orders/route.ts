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

        let order, newItems;
        // table free = create order
        if (await isTableFree(input.tableId)) {

            order = await orderService.createOrder(input);
            setTableOccupied(input.tableId, order.id);
            orderService.printKitchenTicket(order.id);

            return new Response(JSON.stringify({ message: 'Order created' }), { status: 201 });

        } else {
            // table not free we update the previous order
            const currentOrderId = await getCurrentOrderId(input.tableId);
            ({ order, newItems } = await orderService.updateOrder(input, currentOrderId)); 
            orderService.printKitchenTicket(order, newItems);

            return new Response(JSON.stringify({ message: 'Order updated' }), { status: 200 });
        }

    } catch (error) {
        console.log('Error creating order:', error);
        return new Response(JSON.stringify({ error: 'Failed to create order' }), { status: 400 });
    }
}

