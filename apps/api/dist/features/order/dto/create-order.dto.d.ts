export declare class OrderItemDto {
    entity_type: string;
    entity_id: string;
    quantity: number;
    unit_price: number;
}
export declare class CreateOrderDto {
    seller_id: string;
    order_type: string;
    gross_amount: number;
    notes?: string;
    items?: OrderItemDto[];
}
