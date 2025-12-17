import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import * as _ from 'lodash';

import { environment } from '../../../environments/environment';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  apiURL: string = environment.baseUrl;
  bearer_token: string;
  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  baseRequestOptions(): object {
    
    if (isPlatformBrowser(this.platformId)){
			const userData = JSON.parse(localStorage.getItem('userData'));
      this.bearer_token = _.get(userData, '_token', null);
		}
    

    return {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Headers': '*',
        'Accept': 'application/json',
        'Access-Control-Expose-Headers': '*',
        'Authorization': `Bearer ${this.bearer_token}`
        // 'x-api-key': _.get(this.environment, 'xApiToken', ""),
      }),
      withCredentials: true,
      observe: 'response',
    }
  }
  getHttpWithParams<T>(path: string, params: HttpParams): Observable<T> {
    
    let headers = new HttpHeaders({        
      'Accept': 'application/json',
    });
    if (isPlatformBrowser(this.platformId)){
			const userData = JSON.parse(localStorage.getItem('userData'));
      if(userData){
        headers = headers.append('Authorization', `Bearer ${_.get(userData, '_token', null)}`);
      }      
      const sessionToken = sessionStorage.getItem('session_token') ?? null;
      if(sessionToken){
        headers = headers.append('X-Token', `${sessionToken}`);
      }
      // headers = headers.append('Cookie', "PHPSESSID=t8lrqovu6j036rbsrtg82j6o4e; tradesala_session=ZGRUHVVJPMifQniKgDmSOe7kLojSh5tjpLd9E3IY");
      // const sessionToken2 = sessionStorage.getItem('session_token') ?? null
      // console.log('cookie - tradesala_session', this.cookieService.getCookie('tradesala_session'));
      // console.log('cookie - session_token', this.cookieService.getCookie('session_token'));
      // console.log('session ', sessionToken2);
      // console.log('local storage', localStorage.getItem('trade_sess_id'));
		}
    let options: object = {
      headers: headers,
      params: params,
      observe: 'response'
    }
    
    return this.http.request<T>('GET',`${this.apiURL}/${path}`, options);
  }
  getAll<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.apiURL}/${path}`);
  }
  
  get<T>(path: string): Observable<T> {    
    return this.http.get<T>(`${this.apiURL}/${path}`);
  }
  getFilters<T>(path: string, filters: {}): Observable<T> { 
    //const params = new HttpParams(filters); 
    return this.http.get<T>(`${this.apiURL}/${path}`, filters);
  }

  postApi(path: string, data?: object): Observable<any> {
    return this.http.post<any>(`${this.apiURL}/${path}`, data, this.baseRequestOptions());
  }

  patchApi(path: string, data?: object): Observable<any> {
    return this.http.patch<any>(`${this.apiURL}/${path}`, data);
  }

  deleteApi<T>(path: string, body?: object): Observable<T> {
    let options: object = {
      headers: new HttpHeaders({        
        'Accept': 'application/json',
      }),
      observe: 'body',
      body: body,
      responseType: 'json'
    }  
    
    return this.http.delete<T>(`${this.apiURL}/${path}`, options);
  } 
}