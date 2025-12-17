import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { URL } from 'src/app/url.constant';
import { map } from 'rxjs/operators';
import { Wishlist } from 'src/app/core/models/wishlist';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {

  wishListItems: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  wishListItems$ = this.wishListItems.asObservable();

  constructor(
    private api: ApiService
  ) {

  }

  addToWishlist(product_slug: string): Observable<any> {
    const url = URL.wishlist.add;
    return this.api
      .postApi(url, {
        product_slug: product_slug
      });

  }

  removeFromWishlist(user_id: string, wishlist_id: string): Observable<any> {
    const url = URL.wishlist.delete
      .replace('{user_id}', user_id)
      .replace('{wishlist_id}', wishlist_id);
    return this.api.deleteApi(url).pipe(map((resp) => resp));

  }
  getWishlist(user_id: string): Observable<Array<Wishlist>> {
    return this.api
      .getAll<{ wishlists: Array<Wishlist> }>(`v1/wishlist/${user_id}`)
      .pipe(map((resp) => resp.wishlists));
  }
  getWishlistItems(user_id: string, filters: {}): Observable<{meta:any, wishlists:Wishlist}> {
    return this.api
      .postApi(`v1/wishlist/${user_id}`, filters)
      .pipe(map((resp) => resp.body));
  }

  updateWishListItems(item) {
    this.wishListItems.next(item);
  }

}
