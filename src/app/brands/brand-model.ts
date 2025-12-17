import { Product } from "../core/models/product";

export class Brands {
    id: number;
    logo: string;
    name: string;
}

export class BrandModel {
    slug: string;
    name: string;
    brand: { 
        name: string, 
        seo?: { title: string; description: string; keywords: string } 
    };
    meta: [];
    filter: [];
    price_range: [];
    products?: Product;
    
}
