import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { ProductService } from '../core/services/product.service';
import { catchError, of, tap } from 'rxjs';

export const productCollectionResolver: ResolveFn<boolean|any> = (route, state) => {
  const router = inject(Router);
  const slug = route.params['collection'];
  const productService = inject(ProductService);
  return productService.getCollection(slug).pipe(
    //tap((value) => {console.log('tt', value)}),
    catchError((_) => {
      router.navigate(['']);
      return of({});
    })
  );
};
