import prisma from "@/app/lib/prisma";

export async function createMeal(name: string, price: number, categoryId: number, description?: string) {
    return await prisma.product.create({
        data: {
            name,
            price,
            categoryId,
            description
        }
    })
}

export async function updateMeal(id: number, name: string, price: number, categoryId: number, description?: string) {
    return await prisma.product.update({
        where: { id },
        data: {
            name,
            price,
            categoryId,
            description
        }
    })
}

export async function getMeal(id: number) {
    const meal = await prisma.product.findUnique({
        where: { id }
    });
    // get the number of orders for this meal
    const orders = await prisma.order.findMany({
        where: { items: { some: { productId: id } } }
    });
    const updatedOrders = await prisma.orderUpdate.findMany({
        where: { items: { some: { productId: id } } }
    });
    
    return { meal, orders: orders.length + updatedOrders.length };
}

export async function deleteMeal(id: number) {
    return await prisma.category.delete({
        where: { id }
    })
}