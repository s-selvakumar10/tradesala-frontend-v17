import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './services/api.service';
import { map, tap } from 'rxjs/operators';
import { SessionFlow } from '../helper/session-flow';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DeliveryPincodeService {
  pincodeSub = new BehaviorSubject<string>(null);
  pincodeObs$ = this.pincodeSub.asObservable();
  shipping_address = new BehaviorSubject<any>(null);
  constructor(
    private apiService: ApiService,
    protected sessionFlow: SessionFlow,
    @Inject(PLATFORM_ID) private platformID: object
  ) { 
   
  }

  storePincode(pincode = null, address_id=null){
    if(isPlatformBrowser(this.platformID)){
      if(pincode !== null && pincode !== ''){
        localStorage.setItem('delivery_pincode', pincode);      
      }
      const deviceId = this.sessionFlow.deviceId;
      let paramKeys = {
        device_id: deviceId,
        pincode: pincode,
      }
      if(address_id !== null){
        paramKeys = {...paramKeys, ...{address_id: address_id}};
      }
      const params = new HttpParams({
        fromObject: paramKeys
      });
      
      this.apiService.getHttpWithParams<any>(`v1/update-pincode`, params).pipe(
        map(res => res.body),
        tap(res => {
          
          if(res.token){
            if(sessionStorage.getItem('session_token') === null){
              sessionStorage.setItem('session_token', res.token);
            }
          }
          
          if(res.delivery_pincode && res.delivery_pincode !== 'null'){
            localStorage.setItem('delivery_pincode', res.delivery_pincode);
            this.pincodeSub.next(res.delivery_pincode);
          }
          if(res.shipping_addresses?.length){
            this.shipping_address.next(res.shipping_addresses);
            localStorage.removeItem('shipping_address');           
            localStorage.setItem('shipping_address', JSON.stringify(res.shipping_addresses));
          }
        })
      ).subscribe();
    }
  }
  fetchPincode(): Observable<any>{
    const deviceId = this.sessionFlow.deviceId;
      const params = new HttpParams({
        fromObject: {
          device_id: deviceId,
          token: sessionStorage.getItem('session_token')
        }
      });
    return this.apiService.getHttpWithParams<any>(`v1/get-pincode`, params).pipe(
      map(res => res),
      tap(res =>  {
        if(res.token){
          this.pincodeSub.next(res.token);
        }
      })
    )
  }
  getPincode(): Observable<any> {
    
    return new Observable((observer) => {
      const pincode = isPlatformBrowser(this.platformID) ? localStorage.getItem('delivery_pincode') : null
      if(pincode !== null){
        this.pincodeSub.next(pincode);     
        observer.next(pincode);
        observer.complete();
      }
      
    })
    
  }
  
}
