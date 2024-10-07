import { printBill, printTicket } from '@/app/lib/printing';
import prisma from '@/app/lib/prisma';
import { OrderInput, OrderWithItems } from '@/app/types/orders';

async function generatePriceMap(mealIds: number[]): Promise<{ [key: number]: number }> {
    const meals = await prisma.meal.findMany({
        where: { id: { in: mealIds } },
        select: { id: true, price: true }  // Fetch the current price
    });

    // Create a price map for quick lookup
    const priceMap = meals.reduce((acc, meal) => {
        acc[meal.id] = meal.price;
        return acc;
    }, {} as { [key: number]: number });
    return priceMap;
}

export async function createOrder(input: OrderInput) {
    try {
        // Fetch the prices from the database for each meal in the order
        const mealIds = input.items.map(item => item.mealId);

        const priceMap = await generatePriceMap(mealIds);

        // Calculate the total amount
        const totalAmount = input.items.reduce((total, item) => {
            const price = priceMap[item.mealId];
            return total + price * item.quantity;
        }, 0);

        // Create the new order
        const newOrder = await prisma.order.create({
            data: {
                tableId: input.tableId,
                waiterId: input.waiterId,
                status: 'PENDING',
                items: {
                    create: input.items.map(item => ({
                        mealId: item.mealId,
                        quantity: item.quantity,
                        notes: item.notes,
                        price: priceMap[item.mealId],  // Use the price from the backend
                    }))
                },
                totalAmount: totalAmount,
                dailyOrderNumber: await getNextDailyOrderNumber()  // Custom logic for order numbering
            },
            include: { items: true }
        });

        return newOrder;
    } catch (error) {
        console.error("Error creating order:", error);
        throw new Error("Failed to create order");
    }
}


export async function updateOrder(input: OrderInput, orderId: number) {
    try {
        // Fetch the prices from the database for each meal in the order update
        const mealIds = input.items.map(item => item.mealId);

        const priceMap = await generatePriceMap(mealIds);

        // Calculate the update amount using the prices from the backend
        const updateAmount = input.items.reduce((total, item) => {
            const price = priceMap[item.mealId];
            return total + price * item.quantity;
        }, 0);

        // Create the new order items
        const newOrderItems = await Promise.all(input.items.map(async item => {
            return await prisma.orderItem.create({
                data: {
                    mealId: item.mealId,
                    quantity: item.quantity,
                    notes: item.notes,
                    price: priceMap[item.mealId],  // Use the price from the backend
                    orderId: orderId  // Associate with the order
                }
            });
        }));

        // Update total amount of the main order
        await prisma.order.update({
            where: { id: orderId },
            data: {
                totalAmount: { increment: updateAmount },  // Increment totalAmount by updateAmount
            },
            include: { items: true }
        });

        //return the new items ids and the order id
        return {order: orderId, newItems: newOrderItems.map(item => item.id) };
        
    } catch (error) {
        console.error("Error updating order:", error);
        throw new Error("Failed to update order");
    }
}


export async function printKitchenTicket(orderId: number, newItems?: number[]) {
    const items = await prisma.orderItem.findMany({
        where: newItems
            ? { id : { in: newItems } }
            : { orderId: orderId },
        include: { meal: true }
    })

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { table: true, waiter: true }
    })

    if (!order) {
        throw new Error(`Order with id ${orderId} not found`)
    }

    // Generate ticket content
    const ticketContent = `
        Table: ${order.table.number}
        Waiter: ${order.waiter.name}
        Time: ${new Date().toLocaleTimeString()}
        
        Items:
        ${items.map(item => `- ${item.quantity}x ${item.meal.name} ${item.notes ? `(${item.notes})` : ''}`).join('\n\t')}
      `

    // Print ticket (implementation depends on your printing setup)
    await printTicket(ticketContent)
}

export async function finishOrder(orderId: number): Promise<void> {
    const newOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' },
        include:{
            items: {
                include: { meal: true }
            },
            table: true,
            waiter: true
        }
    });
    printCustomerBill(newOrder);
}

export async function printCustomerBill(order: OrderWithItems): Promise<void> {
    // Group items by meal for a cleaner bill
    const groupedItems = order.items.reduce((acc, item) => {
        const key = `${item.mealId}-${item.price}`
        if (!acc[key]) {
            acc[key] = { ...item, quantity: 0 }
        }
        acc[key].quantity += item.quantity
        return acc
    }, {} as Record<string, typeof order.items[number] & { quantity: number }>)

    // Generate bill content
    const billContent = `
    Restaurant Name
    ===============================
    Order #: ${order.dailyOrderNumber}
    Table: ${order.table.number}
    Waiter: ${order.waiter.name}
    Date: ${new Date(order.createdAt).toLocaleDateString()}
    Time: ${new Date(order.createdAt).toLocaleTimeString()}
    
    Items:
    ${Object.values(groupedItems)
            .map(item => `${item.quantity.toString().padStart(2)}x ${item.meal.name.padEnd(20)} $${(item.price * item.quantity).toFixed(2)}`)
            .join('\n')}
    
    ===============================
    Total: $${order.totalAmount.toFixed(2)}
    
    Thank you for dining with us!
  `

    // Print bill (implementation depends on your printing setup)
    await printBill(billContent)

}



async function getNextDailyOrderNumber() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastOrder = await prisma.order.findFirst({
        where: {
            createdAt: {
                gte: today
            }
        },
        orderBy: {
            dailyOrderNumber: 'desc'
        }
    })

    return lastOrder ? lastOrder.dailyOrderNumber + 1 : 1
}
