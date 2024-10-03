import prisma from "@/app/lib/prisma";

export async function getCategories() {
    return await prisma.category.findMany({
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

export async function getCategory(id: number) {
    return await prisma.category.findUnique({
        where: { id },
        include: { products: true }
    })
}