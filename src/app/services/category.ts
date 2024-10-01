import prisma from "@/app/lib/prisma";



export async function getCategories() {
    return await prisma.category.findMany({
        include: { products: true }
    })
}

export async function createCategory(name: string) {
    return await prisma.category.create({
        data: {
            name
        }
    })
}

export async function updateCategory(id: number, name: string) {
    return await prisma.category.update({
        where: { id },
        data: { name }
    })
}

export async function deleteCategory(id: number) {
    return await prisma.category.delete({
        where: { id }
    })
}

export async function createProduct(name: string, price: number, categoryId: number, description?: string) {
    return await prisma.product.create({
        data: {
            name,
            price,
            categoryId,
            description
        }
    })
}

export async function updateProduct(id: number, name: string, price: number, categoryId: number, description?: string) {
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