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

export async function deleteMeal(id: number) {
    return await prisma.category.delete({
        where: { id }
    })
}