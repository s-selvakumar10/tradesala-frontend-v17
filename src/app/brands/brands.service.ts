import {HttpParams} from "@angular/common/http";
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/shared/services/api.service';
import { Brands, BrandModel } from './brand-model';
import { Product } from "../core/models/product";
@Injectable({
  providedIn: 'root'
})
export class BrandsService {

  constructor(private api: ApiService) { }

  getAllBrands(): Observable<any>{
    return this.api.getAll<any>(`v1/brands`).pipe(map((res) => res ));
  }
  
  postAllBrands(filters: {}):Observable<{meta:any, brands:Brands}>{    
    return this.api
      .postApi(`v1/brands`, filters)
      .pipe(map((res)=> res.body));
  }
  getBrand(slug: string):Observable<BrandModel>{    
    return this.api
      .get<BrandModel>(`v1/brand/${slug}`)
      .pipe(map((res)=> res));
  }
  getBrandProducts(slug: string, filters: {}):Observable<{meta:any, products:Product}>{    
    return this.api
      .postApi(`v1/brand/${slug}`, filters)
      .pipe(map((res)=> res.body));
  }
  getBrandFilters(slug: string):Observable<any>{    
    return this.api
    .get<any>(`v1/brand/filters/${slug}`)
    .pipe(map((res)=> res));
  }
}
