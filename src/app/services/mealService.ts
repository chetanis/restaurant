import prisma from "@/app/lib/prisma";

export async function createMeal(name: string, price: number, categoryId: number, description?: string) {
    return await prisma.meal.create({
        data: {
            name,
            price,
            categoryId,
            description
        }
    })
}

export async function updateMeal(id: number, name: string, price: number, categoryId: number, description?: string) {
    return await prisma.meal.update({
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
    const meal = await prisma.meal.findUnique({
        where: { id }
    });
    // get the number of orders for this meal
    const orders = await prisma.order.findMany({
        where: { items: { some: { mealId: id } } }
    });
    const updatedOrders = await prisma.orderUpdate.findMany({
        where: { items: { some: { mealId: id } } }
    });
    
    return { meal, orders: orders.length + updatedOrders.length };
}

export async function deleteMeal(id: number) {
    return await prisma.category.delete({
        where: { id }
    })
}