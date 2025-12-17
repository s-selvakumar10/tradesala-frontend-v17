import { Injectable, Provider } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpBackend,
  HttpXhrBackend,
  HTTP_INTERCEPTORS,
  HttpXsrfTokenExtractor,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class BackendInterceptor implements HttpInterceptor {

  constructor(private tokenExtractor: HttpXsrfTokenExtractor) {}

  // intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
  //   return next.handle(request);
  // }

  intercept(request: HttpRequest<unknown>, next: HttpXhrBackend): Observable<HttpEvent<unknown>> {
    const cookieheaderName = 'X-XSRF-TOKEN';
    let csrfToken = this.tokenExtractor.getToken() as string;
    console.log('csrfToken', csrfToken);
    if (csrfToken !== null && !request.headers.has(cookieheaderName)) {
      request = request.clone({ headers: request.headers.set(cookieheaderName, csrfToken) });
    }
    return next.handle(request);
  }
}

export const BackendInterceptorProvider: Provider = 
  { provide: HTTP_INTERCEPTORS, useClass: BackendInterceptor, multi: true };
  //{ provide: HttpXsrfTokenExtractor, useClass: BackendInterceptor }
