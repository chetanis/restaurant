import { printBill, printTicket } from '@/app/lib/printing';
import prisma from '@/app/lib/prisma';
import { OrderInput } from '@/app/types/orders';


export async function createOrder(input: OrderInput) {
    if (!input.tableId || !input.waiterId || !input.items || input.items.length === 0) {
        throw new Error("Invalid input for creating an order");
    }

    try {
        const newOrder = await prisma.order.create({
            data: {
                tableId: input.tableId,
                waiterId: input.waiterId,
                status: 'PENDING',
                items: {
                    create: input.items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        notes: item.notes,
                        price: item.price
                    }))
                },
                totalAmount: input.items.reduce((total, item) => total + item.price * item.quantity, 0),
                dailyOrderNumber: await getNextDailyOrderNumber()
            },
            include: { items: true }
        });

        return newOrder;
    } catch (error) {
        console.error("Error creating order:", error);
        throw new Error("Failed to create order");
    }
}

export async function printKitchenTicket(orderId: number, updateId?: number) {
    const items = await prisma.orderItem.findMany({
        where: updateId
            ? { orderUpdateId: updateId }
            : { orderId: orderId },
        include: { product: true }
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
        ${items.map(item => `- ${item.quantity}x ${item.product.name} ${item.notes ? `(${item.notes})` : ''}`).join('\n')}
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
                include: { product: true }
            },
            updates: {
                include: {
                    items: {
                        include: { product: true }
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

    // Group items by product for a cleaner bill
    const groupedItems = allItems.reduce((acc, item) => {
        const key = `${item.productId}-${item.price}`
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
            .map(item => `${item.quantity.toString().padStart(2)}x ${item.product.name.padEnd(20)} $${(item.price * item.quantity).toFixed(2)}`)
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


// test:
// export async function updateOrder(input: UpdateOrderInput): Promise<Order> {
//     if (!input.orderId || !input.waiterId || !input.items || input.items.length === 0) {
//         throw new Error("Invalid input for updating an order");
//     }

//     try {
//         const orderUpdate = await prisma.orderUpdate.create({
//             data: {
//                 orderId: input.orderId,
//                 waiterId: input.waiterId,
//                 status: 'PENDING',
//                 items: {
//                     create: input.items.map(item => ({
//                         productId: item.productId,
//                         quantity: item.quantity,
//                         notes: item.notes,
//                         price: item.price,
//                         status: 'PENDING'
//                     }))
//                 },
//                 updateAmount: input.items.reduce((total, item) => total + item.price * item.quantity, 0)
//             },
//             include: { items: true }
//         });

//         // Update total amount of the main order
//         const updatedOrder = await prisma.order.update({
//             where: { id: input.orderId },
//             data: {
//                 totalAmount: { increment: orderUpdate.updateAmount }
//             },
//             include: { items: true }
//         });

//         return updatedOrder;
//     } catch (error) {
//         console.error("Error updating order:", error);
//         throw new Error("Failed to update order");
//     }
// }