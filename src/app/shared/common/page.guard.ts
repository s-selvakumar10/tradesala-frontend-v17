import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { SeoService } from '../services/seo.service';

@Injectable({
  providedIn: 'root'
})
export class PageGuard  {
  
  constructor(private seoService: SeoService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const slug:string = route.data.page_slug;
      console.log(slug);
      this.seoService.fetchMetaData(slug);
      return true;
  }
  
}
