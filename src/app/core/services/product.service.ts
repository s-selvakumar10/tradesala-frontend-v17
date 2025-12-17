import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { delay, filter, map } from 'rxjs/operators';

import { Product, Review, Attributes, PriceRange } from '../models/product';
import { ApiService } from 'src/app/shared/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private api: ApiService) {}

  getProduct(product_slug: string): Observable<Product> {
    return this.api
      .get<{ product: Product }>(`v1/product/${product_slug}`)
      .pipe(map((resp) => resp.product));
  }

  getAllProducts(filters: {}): Observable<{ meta: any; products: Product[] }> {
    return this.api
      .postApi(`v1/products`, filters)
      .pipe(map((resp) => resp.body));
  }

  getProductFilters(filters: {}): Observable<{ meta: any; products: Product[] }> {
    return this.api
      .postApi(`v1/product/get-filters-data`, filters)
      .pipe(map((resp) => resp.body));
  }

  getTrendingProducts(): Observable<Array<Product>> {
    return this.api
      .getAll<{ products: Array<Product> }>('v1/products/trending')
      .pipe(map((resp) => resp.products));
  }

  getFeaturedProducts(): Observable<Array<Product>> {
    return this.api
      .getAll<{ products: Array<Product> }>('v1/products/featured')
      .pipe(map((resp) => resp.products));
  }

  getNewArraivalProducts(): Observable<Array<Product>> {
    return this.api
      .getAll<{ products: Array<Product> }>('v1/products/latest')
      .pipe(map((resp) => resp.products));
  }

  getSpecialProducts(): Observable<Array<Product>> {
    return this.api
      .getAll<{ products: Array<Product> }>('v1/products/special')
      .pipe(map((resp) => resp.products));
  }
 

  getRelatedProducts(product_slug: string): Observable<Array<Product>> {
    return this.api
      .getAll<{ products: Array<Product> }>(`v1/products/${product_slug}/related`)
      .pipe(map((resp) => resp.products));
  }

  getRecommendedProducts(product_slug: string): Observable<Array<Product>> {
    return this.api
      .getAll<{ products: Array<Product> }>(`v1/products/${product_slug}/recommended`)
      .pipe(
        delay(0),
        map((resp) => resp.products)
      );
  }
  getSellerProducts(product_slug: string): Observable<Array<Product>> {
    return this.api
      .getAll<{ products: Array<Product> }>(`v1/products/${product_slug}/seller-product`)
      .pipe(map((resp) => resp.products));
  }
  getProductPriceRange(slug: string): Observable<PriceRange>{
    return this.api     
      .get<PriceRange>(`v1/products/${slug}/get-price`)
      .pipe(map((resp) => resp));
  }

  // REVIEW
  storeProductReview(
    product_slug: string,
    rating: number,
    review: string
  ): Observable<any> {
    const url = `v1/product/${product_slug}/review`;

    return this.api.postApi(url, {
      rating: rating,
      review: review,
    });
  }

  getProductReviews(product_slug: string): Observable<Array<Review>> {
    return this.api
      .getAll<{ reviews: Array<Review> }>(`v1/product/${product_slug}/review`)
      .pipe(map((resp) => resp.reviews));
  }

  getAllReviews(user_id: string): Observable<Array<Review>> {
    return this.api
      .getAll<{ reviews: Array<Review> }>(`v1/reviews/${user_id}`)
      .pipe(
        delay(0),
        map((resp) => resp.reviews)
      );
  }

  checkPincode(postData): Observable<any>{
    return this.api.postApi('v1/shipping-rate-estimate', postData).pipe(      
      map((resp) => resp.body)
    );
  }
}
