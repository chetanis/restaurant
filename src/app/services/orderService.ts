import { printBill, printTicket } from '@/app/lib/printing';
import prisma from '@/app/lib/prisma';
import { OrderInput } from '@/app/types/orders';

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
    if (!input.tableId || !input.waiterId || !input.items || input.items.length === 0) {
        throw new Error("Invalid input for creating an order");
    }

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
    if (!input.waiterId || !input.items || input.items.length === 0) {
        throw new Error("Invalid input for updating an order");
    }

    try {
        // Fetch the prices from the database for each meal in the order update
        const mealIds = input.items.map(item => item.mealId);

        const priceMap = await generatePriceMap(mealIds);

        // Calculate the update amount using the prices from the backend
        const updateAmount = input.items.reduce((total, item) => {
            const price = priceMap[item.mealId];
            return total + price * item.quantity;
        }, 0);

        // Create the order update
        const orderUpdate = await prisma.orderUpdate.create({
            data: {
                orderId: orderId,
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
                updateAmount: updateAmount  // Use calculated updateAmount
            },
            include: { items: true }
        });

        // Update total amount of the main order
        await prisma.order.update({
            where: { id: orderId },
            data: {
                totalAmount: { increment: updateAmount }  // Increment totalAmount by updateAmount
            },
            include: { items: true }
        });

        return orderUpdate;
    } catch (error) {
        console.error("Error updating order:", error);
        throw new Error("Failed to update order");
    }
}


export async function printKitchenTicket(orderId: number, updateId?: number) {
    const items = await prisma.orderItem.findMany({
        where: updateId
            ? { orderUpdateId: updateId }
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

    if (updateId) {
        await prisma.orderUpdate.update({
            where: { id: updateId },
            data: { printedForKitchen: true }
        })
    }
}

export async function printCustomerBill(orderId: number): Promise<void> {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: { meal: true }
            },
            updates: {
                include: {
                    items: {
                        include: { meal: true }
                    }
                }
            },
            table: true,
            waiter: true
        }
    })

    if (!order) {
        throw new Error(`Order with id ${orderId} not found`)
    }

    // Combine items from original order and all updates
    const allItems = [
        ...order.items,
        ...order.updates.flatMap(update => update.items)
    ]

    // Group items by meal for a cleaner bill
    const groupedItems = allItems.reduce((acc, item) => {
        const key = `${item.mealId}-${item.price}`
        if (!acc[key]) {
            acc[key] = { ...item, quantity: 0 }
        }
        acc[key].quantity += item.quantity
        return acc
    }, {} as Record<string, typeof allItems[number] & { quantity: number }>)

    // Calculate total
    const total = Object.values(groupedItems).reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    )

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
    Total: $${total.toFixed(2)}
    
    Thank you for dining with us!
  `

    // Print bill (implementation depends on your printing setup)
    await printBill(billContent)

    // Update order status
    await prisma.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' }
    })
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
