import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CartService } from 'src/app/shared/services/cart.service';

@Injectable({
  providedIn: 'root'
})
export class CartResolver  {

  constructor(private cartService: CartService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Observable<any>> {    
    return new Promise((resolve, reject) => {      
      const countryObservable = this.cartService.products;
      countryObservable.subscribe({ next: (data: any) => {        
          resolve(countryObservable)
        }
      });
    });
  }
 
}
