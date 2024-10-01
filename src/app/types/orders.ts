export interface OrderItem {
    productId: number
    quantity: number
    notes?: string
    price: number
}

export interface CreateOrderInput {
    tableId: number
    items: OrderItem[]
    waiterId: string
}

export interface UpdateOrderInput {
    orderId: number
    items: OrderItem[]
    waiterId: string
}