import { Prisma } from "@prisma/client";

export interface OrderInput {
    tableId: number;
    items: OrderItem[];
    waiterId: string;
    toPrint: boolean;  
}

export interface OrderItem {
    mealId: number;
    quantity: number;
    notes?: string;
}

export type OrderWithItems = Prisma.OrderGetPayload<{
    include: { items: {
        include: { meal: true}
    }; table: true; waiter: true }
}>;

export function isOrderInput(input: unknown): input is OrderInput {
    return (
        typeof input === 'object' &&
        input !== null &&
        typeof (input as OrderInput).tableId === 'number' &&
        Array.isArray((input as OrderInput).items) &&
        typeof (input as OrderInput).waiterId === 'string' &&
        typeof (input as OrderInput).toPrint === 'boolean' &&
        (input as OrderInput).items.every(isOrderItem)
    );
}

function isOrderItem(item: unknown): item is OrderItem {
    return (
        typeof item === 'object' &&
        item !== null &&
        typeof (item as OrderItem).mealId === 'number' &&
        typeof (item as OrderItem).quantity === 'number' &&
        ((item as OrderItem).notes === undefined || typeof (item as OrderItem).notes === 'string')
    );
}