import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ApiService } from 'src/app/shared/services/api.service';
import { Product } from 'src/app/core/models/product';

export interface ProductSearchResult {
  brand: string;
  brand_id: number;
  category: string;
  category_id: number;
  sub_category: string;
  listing_category: string[];
  product_name: string;
  product_slug: string;
  product_img: string;
  tsid: string;
  p_id: string;
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(private http: HttpClient, private api: ApiService) {}

  getResultList(term: {}): Observable<any> {
    return this.api
      .postApi(`v1/products/search`, term)
      .pipe(map((resp) => resp.body));
  }
  getSearchPage(filters: {}): Observable<{ meta: any; products: Product[] }> {
    return this.api
      .postApi(`v1/products/search-page`, filters)
      .pipe(
        map(
          (resp) => resp.body)
        );
  }
  
  getSearchFilters(keywords: string):Observable<any>{    
    return this.api
    .get<any>(`v1/products/search-filters/${keywords}`)
    .pipe(map((res)=> res));
  }
}
