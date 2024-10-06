import prisma from "@/app/lib/prisma"
import { Table, TableStatus } from "@prisma/client"

export async function getTables(): Promise<Table[]> {
    try {
        return await prisma.table.findMany({
            include: { currentOrder: true }
        })
    } catch (error) {
        console.error("Error fetching tables:", error)
        throw error
    }
}

export async function createTable(number: number, numberOfChairs: number): Promise<Table> {
    if (number <= 0 || numberOfChairs <= 0) {
        throw new Error("Invalid table number or number of chairs")
    }
    try {
        return await prisma.table.create({
            data: {
                number,
                numberOfChairs,
                status: TableStatus.FREE
            }
        })
    } catch (error) {
        console.error("Error creating table:", error)
        throw error
    }
}

export async function updateTable(id: number, number: number, numberOfChairs: number): Promise<Table> {
    if (id <= 0 || number <= 0 || numberOfChairs <= 0) {
        throw new Error("Invalid input for updating table")
    }
    try {
        return await prisma.table.update({
            where: { id },
            data: {
                number,
                numberOfChairs
            }
        })
    } catch (error) {
        console.error("Error updating table:", error)
        throw error
    }
}

export async function deleteTable(id: number): Promise<Table> {
    if (id <= 0) {
        throw new Error("Invalid table ID")
    }
    try {
        return await prisma.table.delete({
            where: { id }
        })
    } catch (error) {
        console.error("Error deleting table:", error)
        throw error
    }
}

export async function isTableFree(id: number): Promise<boolean> {
    if (id <= 0) {
        throw new Error("Invalid table ID")
    }
    try {
        const table = await prisma.table.findUnique({
            where: { id }
        })
        return table?.status === TableStatus.FREE
    } catch (error) {
        console.error("Error checking if table is free:", error)
        throw error
    }
}

export async function setTableFree(id: number): Promise<Table> {
    if (id <= 0) {
        throw new Error("Invalid table ID")
    }
    try {
        return await prisma.table.update({
            where: { id },
            data: {
                status: TableStatus.FREE,
                currentOrderId: null
            }
        })
    } catch (error) {
        console.error(`Error setting table status to FREE:`, error)
        throw error
    }
}

export async function setTableOccupied(id: number,orderNumber:number): Promise<Table> {
    if (id <= 0) {
        throw new Error("Invalid table ID")
    }
    try {
        return await prisma.table.update({
            where: { id },
            data: {
                status: TableStatus.OCCUPIED,
                currentOrderId: orderNumber
            }
        })
    }catch (error) {
        console.error(`Error setting table status to OCCUPIED:`, error)
        throw error
    }
}

export async function getCurrentOrderId(id: number) {
    if (id <= 0) {
        throw new Error("Invalid table ID")
    }
    try {
        const table = await prisma.table.findUnique({
            where: { id },
            include: { currentOrder: true }
        })
        if (!table) {
            throw new Error(`Table with ID ${id} not found`)
        }
        if (!table.currentOrder) {
            throw new Error(`Table with ID ${id} does not have a current order`)
        }
        return table.currentOrder.id
    } catch (error) {
        console.error("Error fetching current order for table:", error)
        throw error
    }
}