import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BrandsService } from '../brands.service';
import { BrandModel } from '../brand-model';

@Injectable({
  providedIn: 'root'
})
export class BrandResolver  {
  constructor(private brandService: BrandsService, private router: Router){}
  resolve(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): Observable<BrandModel> {
    const brandSlug = route.params['slug'];
    return this.brandService.getBrand(brandSlug).pipe(
      catchError((_) => {
        this.router.navigate(['']);
        return of(new BrandModel());
      })
    );
  }
}
