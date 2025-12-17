import { Category } from "src/app/category/models/category";

export class Price {
  amount: string;
  currency: string;
}

export class Variant {
  id: number;
  name: string;
  sku: string;
  price: string;
  weight: string;
  height: string;
  width: string;
  depth: string;
  is_master: boolean;
  slug: string;
  description: string;
  track_inventory: boolean;
  cost_price: string;
  total_on_hand: number;
  display_price: string;
  options_text: string;
  in_stock: boolean;
  is_backorderable: boolean;
  is_destroyed: boolean;
  is_orderable: boolean;
  options: any;
  selling_price: Price;
  max_retail_price: Price;  
}

export class RatingSummary {
  average_rating: number;
  review_count: number;
}

export class SEO {
  title: string;
  description: string;
  keywords: string;
}

export class Brand {
  name: string;
  slug: string;
}

export class Product {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  category?: Category;
  sub_category?: Category;
  summary: string;
  description: string;
  brand?: Brand;
  has_variants: boolean;
  has_stock: boolean;
  stock: StockStatus;
  condition: string;
  price: number;
  special_price: number;
  quantity?: number;
  master: Variant;
  discount?: number;
  discounts?: any;
  selected?: boolean;
  combo_offers?: any;
  applied_coupon: {
    product_based: boolean, 
    qty_based: boolean
  }
  media: Media;
  seller_data: Array<any>[];
  is_featured: boolean;
  is_bestseller: boolean;
  wishlist: any;
  seller?: Seller;
  sellerId: any;
  attributes: Attributes[];
  variants: Variants[];
  rating_summary: RatingSummary;
  seo?: SEO;
  specification?: AdditionalData;
  dimensions: Dimension;
  shipping: Shipping;
  static id: any;
  static qnt: any;
  
}
export class Shipping{
  smart_shipping: boolean;
  has_shipping_charges: boolean;
  shipping_cost: boolean;
}
export class Variants {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  special_price: string;
  has_stock: boolean;
  stock: VariantStocks;
  attributes: VariantAttributes[]
}

export class VariantStocks {
  total_on_hand: number;
  minimum_order: number;
  bulk_order: number;
  maximum_order: number;
  stock_status: string;
}
export class VariantAttributes {
  attribute_id: number;
  attribute_value_id: number
}
export class Attributes {
  id: number;
  code: string;
  name: string;
  frontend_type: string;
  items: Items[]
}

export class Items {
  id: number;
  name: string;
  value: string;
  color: string;
}
export class StockStatus {
  bulk_order: number;
  maximum_order: number;
  minimum_order: number;
  stock_status: string;
  total_on_hand: number;
}
export class Seller {
  id: number;
  name: string;
}

export class Media {
  front_image: string;
  images?: string[] | boolean[];
  videos?: Video[];
  video_file?: string | boolean;
  youtube_url?: string | boolean;
}
export class Video {
  url: string;
  thumbnail: string;
}
export class Review {
  name: string;
  review: string;
  rating: number;
  posted_date: Date;
}
export class Dimension {
  length_unit: LengthUnit;
  weight_unit: weightUnit;
}
export class LengthUnit{
  length: number;
  width: number;
  height: number;
  length_class: LengthClass;
}
export class LengthClass{
  name: string;
  desc: string;
}
export class weightUnit{
  weight: number;
  weight_class: WeightClass;
}
export class WeightClass{
  name: string;
  desc: string;
}
export class AdditionalData {
  data?: string[] | boolean[];
}

export class PriceRange{
  minPrice: number;
  maxPrice: number;
}
