export interface OrderInput {
    tableId: number;
    items: OrderItem[];
    waiterId: string;
}

export interface OrderItem {
    productId: number;
    quantity: number;
    notes?: string;
    price: number;
}

export function isOrderInput(input: unknown): input is OrderInput {
    return (
        typeof input === 'object' &&
        input !== null &&
        typeof (input as OrderInput).tableId === 'number' &&
        Array.isArray((input as OrderInput).items) &&
        typeof (input as OrderInput).waiterId === 'string' &&
        (input as OrderInput).items.every(isOrderItem)
    );
}

function isOrderItem(item: unknown): item is OrderItem {
    return (
        typeof item === 'object' &&
        item !== null &&
        typeof (item as OrderItem).productId === 'number' &&
        typeof (item as OrderItem).quantity === 'number' &&
        typeof (item as OrderItem).price === 'number' &&
        ((item as OrderItem).notes === undefined || typeof (item as OrderItem).notes === 'string')
    );
}