import { EnvironmentInjector, Inject, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, onErrorResumeNext } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { User, UserShippingAddress } from './user.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { CartService } from '../shared/services/cart.service';
import { AddressService } from '../core/services/address.service';
import { DeliveryPincodeService } from './../shared/delivery-pincode.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user = new BehaviorSubject<User>(null);
  shipping_address = new BehaviorSubject<any>(null);
  cartService: CartService;
  private tokenExpirationTimer: any;

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private api: ApiService,
    private addressService: AddressService,
    private deliveryPincodeService: DeliveryPincodeService,
    private injector: EnvironmentInjector,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { 
    //this.deliveryPincodeService.getPincode().subscribe();
  }

  getAuthorizationToken(){
     const userData = isPlatformBrowser(this.platformId) ? JSON.parse(localStorage.getItem('userData') || '{}'): null;
     if(userData){
      return userData._token;
     }
     return null;
  }
  signIn(username: String, password: String) {
    let url = `${environment.baseUrl}${'/v1/login'}`;
    return this.http
      .post<any>(
       url,
        {
          username: username,
          password: password,
        }
      )
      .pipe(
        tap(resData => {
          const tokenExpiry = new Date(
            new Date().getTime() + resData.expires_in * 1000
          );
         
          const pincode = resData.user.delivery_pincode;
          const user = new User(resData.user.email,resData.user.name,resData.user.mobile, resData.user.id, pincode, resData.token, tokenExpiry)
          this.user.next(user);          
          this.deliveryPincodeService.shipping_address.next(resData.user.shipping_addresses);
          this.deliveryPincodeService.pincodeSub.next(pincode);
          this.autoLogout(resData.expires_in * 1000);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('userData', JSON.stringify(user));
            localStorage.removeItem('shipping_address');
            localStorage.setItem('shipping_address', JSON.stringify(resData.user.shipping_addresses));
            localStorage.removeItem('delivery_pincode');
            if(pincode !== null){
              localStorage.setItem('delivery_pincode', pincode);
            }
            
            
          }
          this.getAuthorizationToken();
        })
      );
  }

  autoSignIn() {     
    const userData: {
      id: string,
      name: string,
      mobile: string,
      email: string,
      delivery_pincode: string,
      _token: string,
      _tokenExpirationDate: string
    } = isPlatformBrowser(this.platformId) ? JSON.parse(localStorage.getItem('userData')): null;
    const userShippingAddress = isPlatformBrowser(this.platformId) ? JSON.parse(localStorage.getItem('shipping_address') || null): null;
    
    if(sessionStorage.getItem('session_token') !== null){
      this.deliveryPincodeService.storePincode(localStorage.getItem('delivery_pincode'));
    }

    if (!userData) {
      return;
    }
    if(userShippingAddress === null){
      this.addressService.getShippingAddress(userData.id).subscribe(res => {
          
       this.deliveryPincodeService.shipping_address.next(res.user.shipping_addresses);
       localStorage.removeItem('shipping_address');
       localStorage.setItem('shipping_address', JSON.stringify(res.user.shipping_addresses));
      }, err => {
        console.log(err);
      })
     
    } else {
      this.deliveryPincodeService.shipping_address.next(userShippingAddress); 
    }
    
    const loadedUser = new User(userData.email, userData.name, userData.mobile, userData.id, userData.delivery_pincode, userData._token, new Date(userData._tokenExpirationDate));
    
    
    if (loadedUser.token) {
      this.user.next(loadedUser);
      //this.fetchAutoLogin(loadedUser);
      //localStorage.setItem('delivery_pincode', loadedUser.delivery_pincode);
      this.deliveryPincodeService.pincodeSub.next(loadedUser.delivery_pincode);
      const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  fetchAutoLogin(data){
    let url = `${environment.baseUrl}${'/v1/auto-login'}`;
    return this.http
      .post<any>(
       url,
       {...data, token: this.getAuthorizationToken()}
      )
      .subscribe({
        next: (resData) =>{         
          if(resData && resData.token){            
            const tokenExpiry = new Date(
              new Date().getTime() + resData.expires_in * 1000
            );
            const pincode = resData.user.customer_shipping_address.shipping_address.pincode;
            const user = new User(resData.user.email,resData.user.name,resData.user.mobile, resData.user.id, pincode, resData.token, tokenExpiry)
            this.user.next(user);
            this.autoLogout(resData.expires_in * 1000);
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('userData', JSON.stringify(user));
            }
            this.getAuthorizationToken();
          }
        },
        error: (err)=>{          
          if(err && err.status == 404){
            this.clearLogout();           
          }
        }
      });
  }

  signUp(email: String, moblle: String) {
    let url = `${environment.baseUrl}${'/v1/register'}`;
    return this.http.post<any>(
      url,
      {
        email: email,
        mobile_number: moblle,
      }
    );
  }

  otpVerify(token: string, email_otp: String, mobile_otp: String, name: String,  email: string, mobile_number: string, password: String) {
    let url = `${environment.baseUrl}${'/v1/register-validate-otp'}`;
    return this.http.post<any>(
      url,
      {
        id: token,
        mobile_otp: mobile_otp,
        email_otp: email_otp,
        email: email,
        mobile_number: mobile_number,
        password: password,
        name: name
      }
    );
  }

  completeSignUp(token: String, name: String, email: String, moblle: String, password: string) {
    let url = `${environment.baseUrl}${'/v1/register-user'}`;
    return this.http.post<any>(
      url,
      {
        id: token,
        name: name,
        email: email,
        mobile_number: moblle,
        password: password,
      }
    );
  }
  editUser(token: string, name: string, mobile: string, email: string): Observable<any> {
    let url = `${'v1/edit-user'}`; 
   
    return this.api 
      .postApi(url, {
        id: token,
        name: name,
        mobile: mobile,
        email: email,
      }).pipe(map((resp) => resp.body));
  }
  
  passwordChanged(token: string, email: string, current_password: string, password: string, confirm_password: string): Observable<any> {
    let url = `${'v1/change-password'}`;    
    return this.api
      .postApi(url, {
        id: token,
        email: email,
        current_password: current_password,
        password: password,
        confirm_password: confirm_password
      });
  }

  passwordForgotten(email: string){
    let url = `${environment.baseUrl}${'/v1/password/email'}`;
    return this.http.post<any>(url, {
        email: email,
      });
  }
  
  resetPassword(token: string, email: string, password: string, confirm_password: string): Observable<any>{
    let url = `${environment.baseUrl}${'/v1/password/reset'}`;
    return this.http.post<any>(url, {
      token: token,
      email: email,
      password: password,
      confirm_password: confirm_password
    });
  }

  logout() {   
    return this.api.postApi('v1/logout', {
      token: this.getAuthorizationToken()
    }).pipe(
      map((res) => res.body),
    )
    .subscribe((res) => {
      
      if(res.status){
          this.clearLogout();
      }  
    }, (err) => {      
      if(err.status == 404){
         this.clearLogout();
      }
    });
    
  }
  clearLogout(){
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('userData');
      localStorage.removeItem('delivery_pincode');
      localStorage.removeItem('shipping_address');
      this.deliveryPincodeService.pincodeSub.next(null);
    }
    this.user.next(null);
    this.deliveryPincodeService.shipping_address.next(null);
    this.getAuthorizationToken();
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
    this.router.navigate(['/']);
    this.injector.runInContext(() => {
        const cartService = inject(CartService) // fine
        cartService.getProducts();
        //cartService.products.subscribe();
    });
  }
  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }


}
