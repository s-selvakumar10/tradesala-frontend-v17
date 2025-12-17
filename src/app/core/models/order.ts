import { Product } from "./product";

export class Orders {
    order_id: string;
    order_date: string;
    seller_name: string;
    seller_id: number;
    status: string;
    status_no: number;
    sub_total: number;
    total: number;
    customer_details: Customer;
    billing_address: Address;
    shipping_address: Address;
    products: Product;
    order_status: OrderStatus;
}

export class Customer {
    name: string;
    mobile: string;
    email: string;
    gst_no: string
}
export class Address {
    name: string;
    mobile: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    country: string;
    pincode: string
}

export class OrderStatus{
    id: number;
    name: string;
}