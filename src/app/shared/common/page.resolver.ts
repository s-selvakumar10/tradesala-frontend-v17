import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { SeoService } from '../services/seo.service';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PageResolver  {
  constructor(private seoService: SeoService, private router: Router) {}
  
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<Observable<any>> {    
    const slug:string = route.data.page_slug;
    return this.seoService.getMetaInfo(slug).pipe(
      catchError(_ => {       
        return of({});
      })
    )
    // return new Promise((resolve, reject) => {      
    //   const seoMeta = this.seoService.metaData; 
    //   console.log(seoMeta);     
    //   seoMeta.subscribe({
    //      next: (data: any) => {        
    //       resolve(seoMeta);
    //     },
    //     error: (err: any) => {
    //       reject();
    //     }
    //   });
    // });
  }
}
