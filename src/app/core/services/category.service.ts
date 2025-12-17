import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Category } from 'src/app/category/models/category';

import { ApiService } from 'src/app/shared/services/api.service';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  categories = new BehaviorSubject<Category[]>(null);
  constructor(
    private api: ApiService,
    private productService: ProductService
  ) {}

  fetchAll() {
    this.api
      .getAll<{ categories: Category[] }>('v1/categories')
      .subscribe((response) => {
        this.categories.next(response.categories);
      });
  }

  getCategory(category_slug: string): Observable<Category> {
    return this.api
      .get<{ category: Category }>(`v1/category/${category_slug}`)
      .pipe(map((resp) => resp.category));
  }

  getCategoryProducts(slug, filterData) {
    let filters = filterData;
    filters['categories'] = [slug];
    return this.productService.getAllProducts(filters);
  }

  getProductFilters(slug, filterData) {
    let filters = filterData;
    filters['categories'] = [slug];
    return this.productService.getProductFilters(filters);
  }
  getRangePrice(slug){
    return this.productService.getProductPriceRange(slug);
  }
}
