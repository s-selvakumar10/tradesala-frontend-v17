import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CategoryService } from 'src/app/core/services/category.service';
import { ProductService } from 'src/app/core/services/product.service';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryResolver  {
  constructor(private categoryService: CategoryService, private router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Category> {
    const categorySlug = route.params['slug'];

    return this.categoryService.getCategory(categorySlug).pipe(
      catchError((_) => {
        this.router.navigate(['']);
        return of(new Category());
      })
    );
  }
}
