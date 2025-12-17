import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor(private apiService: ApiService) {

   }
  getLiveLocation(): Observable<any>{
    return this.apiService.get<any>('v1/ip2-location').pipe(map(res => res))
  }
  getCurrentPosition(): Observable<any> {
    return new Observable((observer) => {
      console.log('navigator',navigator)
      if ('geolocation' in navigator) {
        // navigator.geolocation.watchPosition(
        //   (position) => {
        //     console.log('position', position);
        //   },
        //   (error) => {
        //    console.log('err',error);
        //   }
        // );
        navigator.geolocation.getCurrentPosition(
          (position) => {
            observer.next(position);
            observer.complete();
          },
          (error) => {
            observer.error(error);
          }
        );
      } else {
        observer.error('Geolocation is not available in this browser.');
      }
    });
  }
}
